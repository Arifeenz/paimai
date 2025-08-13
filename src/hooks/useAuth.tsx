import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          toast({
            title: "ไม่สามารถตรวจสอบสถานะการเข้าสู่ระบบได้",
            description: "กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง",
            variant: "destructive"
          });
        }
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error: any) {
        console.error('Session error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
          toast({
            title: "เกิดข้อผิดพลาดในการตรวจสอบสถานะ",
            description: "กรุณารีเฟรชหน้าเว็บและลองใหม่อีกครั้ง",
            variant: "destructive"
          });
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }

        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          if (mounted) {
            setSession(null);
            setUser(null);
          }
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "เกิดข้อผิดพลาดในการออกจากระบบ",
          description: "แต่ข้อมูลการเข้าสู่ระบบได้ถูกล้างออกแล้ว",
          variant: "destructive"
        });
        // Force clear local state even if server-side logout fails
        setSession(null);
        setUser(null);
      } else {
        toast({
          title: "ออกจากระบบเรียบร้อย",
          description: "ขอบคุณที่ใช้บริการ"
        });
      }
    } catch (error: any) {
      console.error('Sign out catch error:', error);
      toast({
        title: "เกิดข้อผิดพลาดในการออกจากระบบ",
        description: error.message || "แต่ข้อมูลการเข้าสู่ระบบได้ถูกล้างออกแล้ว",
        variant: "destructive"
      });
      // Force clear local state
      setSession(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};