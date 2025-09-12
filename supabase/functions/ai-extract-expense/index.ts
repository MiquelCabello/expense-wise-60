import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIExtractionResponse {
  vendor: string;
  expense_date: string;
  amount_gross: number;
  tax_amount: number;
  amount_net: number;
  tax_rate: number;
  tax_label: 'VAT' | 'IVA' | 'GST' | 'NONE';
  currency: 'EUR' | 'USD' | 'GBP' | 'CHF';
  document_country: string;
  vendor_vat_id?: string;
  category_suggestion: string;
  payment_method_guess: 'CARD' | 'CASH' | 'TRANSFER' | 'OTHER';
  project_code_guess?: string;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request data
    const { file_id } = await req.json();

    if (!file_id) {
      return new Response(
        JSON.stringify({ error: 'file_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing file extraction for file_id:', file_id);

    // Get file information from database
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', file_id)
      .single();

    if (fileError || !fileData) {
      console.error('File not found:', fileError);
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get active categories for context
    const { data: categories } = await supabase
      .from('categories')
      .select('name')
      .eq('status', 'ACTIVE');

    const categoryNames = categories?.map(cat => cat.name).join(', ') || 'Viajes, Dietas, Transporte, Alojamiento, Material, Software, Otros';

    // Create the system prompt with schema
    const systemPrompt = `Eres un sistema experto financiero multipaís para extracción de datos de tickets y facturas.

CATEGORÍAS DISPONIBLES: ${categoryNames}

Extrae los datos de la imagen y devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:

{
  "vendor": "string",
  "expense_date": "YYYY-MM-DD", 
  "amount_gross": 0.00,
  "tax_amount": 0.00,
  "amount_net": 0.00,
  "tax_rate": 0.00,
  "tax_label": "VAT|IVA|GST|NONE",
  "currency": "EUR|USD|GBP|CHF",
  "document_country": "ES|FR|US|...",
  "vendor_vat_id": "string|null",
  "category_suggestion": "string",
  "payment_method_guess": "CARD|CASH|TRANSFER|OTHER",
  "project_code_guess": "string|null",
  "notes": "string|null"
}

REGLAS IMPORTANTES:
- Detecta automáticamente el país del documento
- Normaliza fechas a formato YYYY-MM-DD
- Usa punto (.) como separador decimal en números
- Si category_suggestion no coincide exactamente con las categorías disponibles, usa "Otros"
- Para tax_label: IVA para España, VAT para otros países europeos, GST para Reino Unido, NONE si no aplica
- Calcula amount_net = amount_gross - tax_amount
- Si no hay impuestos, tax_amount=0, tax_rate=0, tax_label="NONE"
- Devuelve SOLO el JSON, sin texto adicional`;

    // Prepare image data for Gemini (we'll use a placeholder URL since we need to implement storage)
    const imageUrl = `data:${fileData.mime_type};base64,placeholder`; // This would need proper implementation with storage

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: fileData.mime_type,
                data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" // Placeholder base64 for demo
              }
            }
          ]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              vendor: { type: "string" },
              expense_date: { type: "string" },
              amount_gross: { type: "number" },
              tax_amount: { type: "number" },
              amount_net: { type: "number" },
              tax_rate: { type: "number" },
              tax_label: { type: "string", enum: ["VAT", "IVA", "GST", "NONE"] },
              currency: { type: "string", enum: ["EUR", "USD", "GBP", "CHF"] },
              document_country: { type: "string" },
              vendor_vat_id: { type: "string" },
              category_suggestion: { type: "string" },
              payment_method_guess: { type: "string", enum: ["CARD", "CASH", "TRANSFER", "OTHER"] },
              project_code_guess: { type: "string" },
              notes: { type: "string" }
            },
            required: ["vendor", "expense_date", "amount_gross", "tax_amount", "amount_net", "tax_rate", "tax_label", "currency", "document_country", "category_suggestion", "payment_method_guess"]
          }
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI processing failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiResult = await geminiResponse.json();
    console.log('Gemini response:', geminiResult);

    // Extract the JSON response from Gemini
    const extractedText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!extractedText) {
      return new Response(
        JSON.stringify({ error: 'No data extracted from document' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the extracted JSON
    let extractedData: AIExtractionResponse;
    try {
      extractedData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError, extractedText);
      return new Response(
        JSON.stringify({ error: 'Invalid response format from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and normalize the data
    const normalizedData = {
      ...extractedData,
      amount_gross: Number(extractedData.amount_gross) || 0,
      amount_net: Number(extractedData.amount_net) || 0,
      tax_amount: Number(extractedData.tax_amount) || 0,
      tax_rate: Number(extractedData.tax_rate) || 0,
      currency: extractedData.currency || 'EUR',
      expense_date: extractedData.expense_date || new Date().toISOString().split('T')[0],
    };

    // Validate category suggestion
    const validCategories = categories?.map(cat => cat.name) || [];
    if (!validCategories.includes(normalizedData.category_suggestion)) {
      normalizedData.category_suggestion = 'Otros';
      normalizedData.notes = `${normalizedData.notes || ''} [Categoría original sugerida: ${extractedData.category_suggestion}]`.trim();
    }

    console.log('Extraction completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: normalizedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI extraction:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});