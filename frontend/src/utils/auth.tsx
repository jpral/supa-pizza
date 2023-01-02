import { createContext, useContext, useEffect, useState } from 'react';
import { Session, SupabaseClient } from '@supabase/supabase-js';

export const AuthContext = createContext<{ session: Session | null | undefined }>({ session: null });

export const AuthProvider = ({ supabase, children, ...props }: { supabase: SupabaseClient, children: JSX.Element }) => {
  const [session, setSession] = useState<Session | null>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

  }, [supabase.auth]);
  return (
    <AuthContext.Provider
      value={{
        session
      }}
      {...props}>{children}</AuthContext.Provider>
  )

}
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}