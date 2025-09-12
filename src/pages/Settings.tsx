import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings as SettingsIcon, 
  Euro, 
  Globe, 
  Clock, 
  Moon, 
  Sun,
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  budget_monthly?: number;
  status: string;
}

interface ProjectCode {
  id: string;
  code: string;
  name: string;
  status: string;
}

const Settings = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [projectCodes, setProjectCodes] = useState<ProjectCode[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('es');
  const [timezone, setTimezone] = useState('Europe/Madrid');
  const [currency, setCurrency] = useState('EUR');
  const [defaultVAT, setDefaultVAT] = useState('21');
  const [autoApprovalLimit, setAutoApprovalLimit] = useState('100');
  const [sandboxMode, setSandboxMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const { profile, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [categoriesRes, projectCodesRes] = await Promise.all([
        supabase.from('categories').select('*').eq('status', 'ACTIVE'),
        supabase.from('project_codes').select('*').eq('status', 'ACTIVE')
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (projectCodesRes.data) setProjectCodes(projectCodesRes.data);

    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      // In a real app, this would save to user preferences
      toast({
        title: "Preferencias guardadas",
        description: "Tus preferencias se han actualizado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar las preferencias",
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-8 max-w-6xl">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <SettingsIcon className="mr-3 h-8 w-8" />
            Configuración
          </h1>
          <p className="text-muted-foreground">
            Personaliza las preferencias del sistema y configuración financiera
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Preferencias Generales */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="mr-2 h-5 w-5" />
                Preferencias Generales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tema Oscuro</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Alternar entre tema claro y oscuro
                  </span>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Horaria</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Madrid">Europe/Madrid</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={savePreferences} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Guardar Preferencias
              </Button>
            </CardContent>
          </Card>

          {/* Configuración Financiera */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Euro className="mr-2 h-5 w-5" />
                Configuración Financiera
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda Base</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-vat">IVA por Defecto (%)</Label>
                <Input
                  id="default-vat"
                  type="number"
                  value={defaultVAT}
                  onChange={(e) => setDefaultVAT(e.target.value)}
                  placeholder="21"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto-approval">Límite Aprobación Automática (€)</Label>
                <Input
                  id="auto-approval"
                  type="number"
                  value={autoApprovalLimit}
                  onChange={(e) => setAutoApprovalLimit(e.target.value)}
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground">
                  Gastos menores a este importe se aprueban automáticamente
                </p>
              </div>

              <div className="space-y-2">
                <Label>Modo Sandbox</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Activar para pruebas sin facturación real
                  </span>
                  <Switch
                    checked={sandboxMode}
                    onCheckedChange={setSandboxMode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gestión de Categorías */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gestión de Categorías</CardTitle>
              <CardDescription>Categorías Activas</CardDescription>
            </div>
            {isAdmin && (
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Categoría
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    {category.budget_monthly && (
                      <p className="text-sm text-muted-foreground">
                        Presupuesto: {new Intl.NumberFormat('es-ES', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        }).format(category.budget_monthly)}
                      </p>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {!isAdmin && (
                    <span className="text-sm text-muted-foreground">Solo lectura</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Códigos de Proyecto */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Códigos de Proyecto</CardTitle>
              <CardDescription>Proyectos Activos</CardDescription>
            </div>
            {isAdmin && (
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Proyecto
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectCodes.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{project.code}</p>
                    <p className="text-sm text-muted-foreground">{project.name}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {!isAdmin && (
                    <span className="text-sm text-muted-foreground">Solo lectura</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;