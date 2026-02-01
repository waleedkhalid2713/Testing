import * as React from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

// Single authorized admin email (see project security requirement).
export const ADMIN_EMAIL = "waleedkhalid2713@gmail.com";

type UseAdminResult = {
  loading: boolean;
  session: Session | null;
  isAdmin: boolean;
  userEmail: string | null;
};

export function useAdmin(): UseAdminResult {
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const userEmail = session?.user?.email ?? null;
  const isAdmin = Boolean(userEmail && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  return { loading, session, isAdmin, userEmail };
}
