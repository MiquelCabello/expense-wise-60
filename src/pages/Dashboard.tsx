import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Receipt, 
  TrendingUp, 
  Clock, 
  Users, 
  Euro,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { DashboardKPIs, Expense, ExpensesByCategory } from '@/types/database';

const Dashboard = () => {
  const { profile, isAdmin } = useAuth();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpensesByCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch KPIs
      const { data: expenses } = await supabase
        .from('expenses')
        .select(`
          *,
          category:categories!inner(name),
          employee:profiles!expenses_employee_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (expenses) {
        // Calculate KPIs
        const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount_gross), 0);
        const pendingExpenses = expenses.filter(exp => exp.status === 'PENDING').length;
        
        // Top category
        const categoryTotals = expenses.reduce((acc, exp) => {
          const categoryName = (exp.category as any)?.name || 'Sin categoría';
          acc[categoryName] = (acc[categoryName] || 0) + Number(exp.amount_gross);
          return acc;
        }, {} as Record<string, number>);
        
        const topCategory = Object.entries(categoryTotals)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
        
        // Daily average (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentExpenses = expenses.filter(exp => 
          new Date(exp.expense_date) >= thirtyDaysAgo
        );
        const dailyAverage = recentExpenses.length > 0 
          ? recentExpenses.reduce((sum, exp) => sum + Number(exp.amount_gross), 0) / 30
          : 0;

        setKpis({
          total_expenses: totalExpenses,
          pending_expenses: pendingExpenses,
          top_category: topCategory,
          daily_average: dailyAverage
        });

        // Recent expenses (last 10) - cast to our type
        setRecentExpenses(expenses.slice(0, 10) as any[]);

        // Expenses by category
        const categoryData = Object.entries(categoryTotals)
          .map(([category, amount]) => ({
            category,
            amount,
            count: expenses.filter(exp => (exp.category as any)?.name === category).length
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 6);
        
        setExpensesByCategory(categoryData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: "bg-warning/10 text-warning border-warning/20",
      APPROVED: "bg-success/10 text-success border-success/20", 
      REJECTED: "bg-destructive/10 text-destructive border-destructive/20"
    } as const;
    
    const labels = {
      PENDING: "Pendiente",
      APPROVED: "Aprobado",
      REJECTED: "Rechazado"
    } as const;

    return (
      <Badge className={cn("border", variants[status as keyof typeof variants])}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            ¡Bienvenido, {profile?.name}!
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus gastos de forma inteligente y eficiente
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/upload">
              <Plus className="mr-2 h-4 w-4" />
              Subir Ticket
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis?.total_expenses || 0)}</div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{kpis?.pending_expenses || 0}</div>
            <p className="text-xs text-muted-foreground">Esperando aprobación</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categoría Principal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.top_category || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Mayor gasto</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis?.daily_average || 0)}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Expenses */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gastos Recientes</CardTitle>
              <CardDescription>Últimos 10 gastos registrados</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/expenses">
                <Eye className="mr-2 h-4 w-4" />
                Ver Todos
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay gastos registrados</p>
                <Button asChild className="mt-4">
                  <Link to="/upload">Subir primer ticket</Link>
                </Button>
              </div>
            ) : (
              recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/5 hover:bg-muted/10 transition-smooth">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {expense.status === 'APPROVED' && <CheckCircle className="h-5 w-5 text-success" />}
                      {expense.status === 'REJECTED' && <XCircle className="h-5 w-5 text-destructive" />}
                      {expense.status === 'PENDING' && <Clock className="h-5 w-5 text-warning" />}
                    </div>
                    <div>
                      <p className="font-medium">{expense.vendor}</p>
                      <p className="text-sm text-muted-foreground">
                        {(expense.category as any)?.name || 'Sin categoría'} • {new Date(expense.expense_date).toLocaleDateString('es-ES')}
                        {isAdmin && (expense.employee as any) && (
                          <> • {(expense.employee as any).name}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(expense.amount_gross)}</p>
                    {getStatusBadge(expense.status)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
            <CardDescription>Distribución de gastos este mes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {expensesByCategory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay datos de categorías</p>
              </div>
            ) : (
              expensesByCategory.map((category) => {
                const maxAmount = Math.max(...expensesByCategory.map(c => c.amount));
                const percentage = (category.amount / maxAmount) * 100;
                
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full transition-smooth"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{category.count} gastos</p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Search */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Búsqueda Rápida</CardTitle>
          <CardDescription>Encuentra gastos y tickets rápidamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, empleado, comercio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;