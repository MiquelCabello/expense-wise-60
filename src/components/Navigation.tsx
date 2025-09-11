import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { 
  Receipt, 
  BarChart3, 
  Users, 
  Settings, 
  Upload, 
  Menu,
  LogOut,
  Home,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['ADMIN', 'APPROVER', 'EMPLOYEE'],
  },
  {
    title: 'Gastos',
    href: '/expenses',
    icon: Receipt,
    roles: ['ADMIN', 'APPROVER', 'EMPLOYEE'],
  },
  {
    title: 'Subir Ticket',
    href: '/upload',
    icon: Upload,
    roles: ['ADMIN', 'APPROVER', 'EMPLOYEE'],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['ADMIN', 'APPROVER'],
  },
  {
    title: 'Empleados',
    href: '/employees',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    title: 'Ajustes',
    href: '/settings',
    icon: Settings,
    roles: ['ADMIN', 'APPROVER', 'EMPLOYEE'],
  },
];

export function Navigation() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(profile?.role || 'EMPLOYEE')
  );

  const isActive = (href: string) => location.pathname === href;

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("space-y-1", mobile && "px-4 pt-4")}>
      {filteredNavigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => mobile && setMobileOpen(false)}
            className={cn(
              "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-smooth",
              isActive(item.href)
                ? "bg-primary text-primary-foreground shadow-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              mobile && "text-base py-3"
            )}
          >
            <Icon className={cn("mr-3", mobile ? "h-5 w-5" : "h-4 w-4")} />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-card">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">ExpenseWise</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-1">
          <NavItems />
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">ExpenseWise</span>
              </div>
              <NavItems mobile />
            </SheetContent>
          </Sheet>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile?.email}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      profile?.role === 'ADMIN' 
                        ? "bg-destructive/10 text-destructive" 
                        : profile?.role === 'APPROVER'
                        ? "bg-warning/10 text-warning"
                        : "bg-success/10 text-success"
                    )}>
                      {profile?.role}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Ajustes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}