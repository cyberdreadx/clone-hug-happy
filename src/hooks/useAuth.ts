import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const applySession = async (session: Session | null) => {
      if (!mountedRef.current) return;

      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        setIsAdmin(false);
        setIsPartner(false);
        setLoading(false);
        return;
      }

      try {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", nextUser.id);

        if (!mountedRef.current) return;
        setIsAdmin(roles?.some((r) => r.role === "admin") ?? false);
        setIsPartner(roles?.some((r) => r.role === "partner") ?? false);
      } catch {
        if (!mountedRef.current) return;
        setIsAdmin(false);
        setIsPartner(false);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void applySession(session);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, isAdmin, isPartner, signOut };
};

export const useRequireAuth = (requiredRole?: "admin" | "partner") => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.user) {
        navigate("/login");
      } else if (requiredRole === "admin" && !auth.isAdmin) {
        navigate("/");
      } else if (requiredRole === "partner" && !auth.isPartner && !auth.isAdmin) {
        navigate("/");
      }
    }
  }, [auth.loading, auth.user, auth.isAdmin, auth.isPartner, navigate, requiredRole]);

  return auth;
};
