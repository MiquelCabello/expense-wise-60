import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { 
  Upload, 
  Camera, 
  FileImage, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview: string;
}

interface AIExtractedData {
  vendor: string;
  expense_date: string;
  amount_gross: number;
  tax_amount: number;
  amount_net: number;
  tax_rate: number;
  tax_label: string;
  currency: string;
  document_country: string;
  category_suggestion: string;
  payment_method_guess: string;
  project_code_guess?: string;
  notes?: string;
}

const UploadReceipt = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [projectCode, setProjectCode] = useState('');
  const [notes, setNotes] = useState('');
  const [aiData, setAiData] = useState<AIExtractedData | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [projectCodes, setProjectCodes] = useState<any[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load categories and project codes
  useState(() => {
    const loadData = async () => {
      const [categoriesResult, projectCodesResult] = await Promise.all([
        supabase.from('categories').select('*').eq('status', 'ACTIVE'),
        supabase.from('project_codes').select('*').eq('status', 'ACTIVE')
      ]);

      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (projectCodesResult.data) setProjectCodes(projectCodesResult.data);
    };
    loadData();
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Tipo de archivo no válido",
        description: "Solo se permiten imágenes (JPG, PNG) y PDF",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Archivo demasiado grande",
        description: "El archivo no puede superar los 10MB",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to Supabase Storage (we'll create a simple files table entry for now)
      const checksum = await generateChecksum(file);
      const storageKey = `receipts/${Date.now()}_${file.name}`;

      // Create file record
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .insert({
          original_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          storage_key: storageKey,
          checksum_sha256: checksum,
          uploaded_by: user?.id
        })
        .select()
        .single();

      if (fileError) {
        throw fileError;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      
      setUploadedFile({
        id: fileData.id,
        name: file.name,
        size: file.size,
        type: file.type,
        preview
      });

      toast({
        title: "Archivo subido correctamente",
        description: "Ahora puedes procesar el documento con IA",
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error al subir archivo",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const generateChecksum = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleAIExtraction = async () => {
    if (!uploadedFile) return;

    setExtracting(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-extract-expense', {
        body: { file_id: uploadedFile.id }
      });

      if (error) {
        throw error;
      }

      if (data.success && data.data) {
        setAiData(data.data);
        setExtracted(true);
        toast({
          title: "Datos extraídos con IA",
          description: "Revisa y confirma los datos extraídos",
        });
      } else {
        throw new Error(data.error || 'Error en la extracción');
      }

    } catch (error: any) {
      console.error('AI extraction error:', error);
      toast({
        variant: "destructive",
        title: "Error en extracción IA",
        description: error.message || "No se pudieron extraer los datos",
      });
    } finally {
      setExtracting(false);
    }
  };

  const removeFile = () => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
    setAiData(null);
    setExtracted(false);
    setProjectCode('');
    setNotes('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subir Ticket</h1>
          <p className="text-muted-foreground">
            Sube un ticket o factura y extrae los datos automáticamente con IA
          </p>
        </div>

        {/* Upload Area */}
        {!uploadedFile && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Subir Documento</CardTitle>
              <CardDescription>
                Arrastra y suelta un archivo o selecciona desde tu dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-8 text-center transition-smooth",
                  dragActive 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      {dragActive ? "Suelta el archivo aquí" : "Sube tu ticket o factura"}
                    </p>
                    <p className="text-muted-foreground">
                      JPG, PNG o PDF (máx. 10MB)
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild disabled={uploading}>
                      <label className="cursor-pointer">
                        <FileImage className="mr-2 h-4 w-4" />
                        Seleccionar archivo
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png,application/pdf"
                          onChange={handleFileInput}
                          disabled={uploading}
                        />
                      </label>
                    </Button>
                    
                    <Button variant="outline" asChild disabled={uploading}>
                      <label className="cursor-pointer">
                        <Camera className="mr-2 h-4 w-4" />
                        Tomar foto
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileInput}
                          disabled={uploading}
                        />
                      </label>
                    </Button>
                  </div>

                  {uploading && (
                    <div className="flex items-center justify-center mt-4">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Subiendo archivo...</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* File Preview and Processing */}
        {uploadedFile && !extracted && (
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Archivo Subido</CardTitle>
                <CardDescription>Procesa el documento con IA</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <FileImage className="h-10 w-10 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-success" />
              </div>

              {/* Pre-processing Form */}
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="project-code">Código de Proyecto (Opcional)</Label>
                  <Select value={projectCode} onValueChange={setProjectCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectCodes.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.code} - {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notas (Opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Añade cualquier nota o contexto adicional..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={280}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {notes.length}/280 caracteres
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleAIExtraction} 
                disabled={extracting}
                className="w-full"
              >
                {extracting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analizando con IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Extraer Datos con IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Extracted Data Form */}
        {extracted && aiData && (
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-primary" />
                  Datos Extraídos con IA
                </CardTitle>
                <CardDescription>
                  Revisa y ajusta los datos antes de guardar
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Extraction Results */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Comercio</Label>
                    <Input value={aiData.vendor} readOnly />
                  </div>
                  <div>
                    <Label>Fecha</Label>
                    <Input value={aiData.expense_date} readOnly />
                  </div>
                  <div>
                    <Label>Categoría Sugerida</Label>
                    <Input value={aiData.category_suggestion} readOnly />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Importe Bruto</Label>
                    <Input value={formatCurrency(aiData.amount_gross)} readOnly />
                  </div>
                  <div>
                    <Label>IVA</Label>
                    <Input value={formatCurrency(aiData.tax_amount)} readOnly />
                  </div>
                  <div>
                    <Label>Importe Neto</Label>
                    <Input value={formatCurrency(aiData.amount_net)} readOnly />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Detalles Adicionales</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Moneda:</span> {aiData.currency}
                  </div>
                  <div>
                    <span className="font-medium">País:</span> {aiData.document_country}
                  </div>
                  <div>
                    <span className="font-medium">Tipo de Impuesto:</span> {aiData.tax_label}
                  </div>
                  <div>
                    <span className="font-medium">Método Sugerido:</span> {aiData.payment_method_guess}
                  </div>
                </div>
                {aiData.notes && (
                  <div className="mt-2">
                    <span className="font-medium">Notas IA:</span> {aiData.notes}
                  </div>
                )}
              </div>

              {/* Validation Warning */}
              <div className="flex items-start space-x-3 p-4 bg-warning/10 rounded-lg border border-warning/20">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-warning">Verificación Requerida</p>
                  <p className="text-muted-foreground">
                    Los datos han sido extraídos automáticamente. Por favor, verifica que sean correctos antes de continuar.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar y Guardar Gasto
                </Button>
                <Button variant="outline" onClick={removeFile}>
                  Subir Otro Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadReceipt;