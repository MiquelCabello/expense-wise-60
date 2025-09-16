import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isApprover: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string, retries = 3): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle to avoid errors when no profile exists

      if (error) {
        // Handle specific RLS recursion error
        if (error.code === '42P17' && retries > 0) {
          console.warn(`RLS recursion detected, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchProfile(userId, retries - 1);
        }
        
        console.error('Error fetching profile:', error);
        
        // Show user-friendly error for critical issues
        if (error.code === '42P17') {
          toast({
            variant: "destructive",
            title: "Error de configuración",
            description: "Problema temporal con las políticas de seguridad. Recarga la página.",
          });
        }
        
        return null;
      }

      // If no profile exists, create one with basic info
      if (!data) {
        console.warn('No profile found for user, this should have been created by trigger');
        return null;
      }

      return data as Profile;
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchProfile(userId, retries - 1);
      }
      
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo cargar el perfil del usuario. Verifica tu conexión.",
      });
      
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile data with setTimeout to prevent deadlock
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error de inicio de sesión",
          description: error.message,
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: error.message,
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error de registro",
          description: error.message,
        });
      } else {
        toast({
          title: "Registro exitoso",
          description: "Revisa tu email para confirmar tu cuenta.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: error.message,
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al cerrar sesión",
        description: error.message,
      });
    }
  };

  const isAdmin = profile?.role === 'ADMIN';
  const isApprover = profile?.role === 'ADMIN' || profile?.role === 'APPROVER';

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isApprover,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}