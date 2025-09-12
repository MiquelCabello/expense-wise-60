import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import heroImage from '@/assets/hero-dashboard.jpg';
import { 
  Receipt, 
  TrendingUp, 
  Users, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-8 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
            <Receipt className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Gestión de Gastos
            <br />
            <span className="text-white/90">Inteligente con IA</span>
          </h1>
          
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Automatiza la gestión de gastos empresariales con extracción inteligente de datos, 
            aprobaciones fluidas y analytics avanzados.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-4 text-lg shadow-primary"
              onClick={() => navigate('/auth')}
            >
              Comenzar Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg"
              onClick={() => navigate('/auth')}
            >
              Ver Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Características Principales</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar gastos empresariales de forma eficiente
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="shadow-card border-0 bg-gradient-card">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Extracción IA</CardTitle>
                <CardDescription>
                  Google Gemini extrae automáticamente datos de tickets y facturas
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="shadow-card border-0 bg-gradient-card">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Analytics Avanzados</CardTitle>
                <CardDescription>
                  Visualizaciones y reportes detallados para mejor control financiero
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="shadow-card border-0 bg-gradient-card">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <CardTitle>Multi-Usuario</CardTitle>
                <CardDescription>
                  Roles de Admin, Aprobador y Empleado con permisos granulares
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="shadow-card border-0 bg-gradient-card">
              <CardHeader>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Seguridad Total</CardTitle>
                <CardDescription>
                  Encriptación de extremo a extremo y auditoría completa
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Ahorra tiempo y reduce errores
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Procesamiento instantáneo</h3>
                    <p className="text-muted-foreground">La IA extrae datos en segundos, eliminando entrada manual</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Aprobaciones fluidas</h3>
                    <p className="text-muted-foreground">Workflow automatizado con notificaciones en tiempo real</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Control financiero</h3>
                    <p className="text-muted-foreground">Analytics detallados y exportaciones para contabilidad</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Dashboard de ExpenseWise" 
                className="rounded-2xl shadow-dialog w-full"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-primary/10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              ¿Listo para transformar tu gestión de gastos?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Únete a miles de empresas que ya confían en ExpenseWise
            </p>
            <Button 
              size="lg"
              className="font-semibold px-8 py-4 text-lg shadow-primary"
              onClick={() => navigate('/auth')}
            >
              Empezar Ahora
              <Zap className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
