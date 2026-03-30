import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchRoles = async (userId: string) => {
      try {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);
        if (!mountedRef.current) return;
        setIsAdmin(roles?.some((r) => r.role === "admin") ?? false);
        setIsPartner(roles?.some((r) => r.role === "partner") ?? false);
      } catch {
        if (!mountedRef.current) return;
        setIsAdmin(false);
        setIsPartner(false);
      }
    };

    // Get initial session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mountedRef.current) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await fetchRoles(u.id);
      }
      if (mountedRef.current) setLoading(false);
    });

    // Then listen for changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;
        // Skip INITIAL_SESSION since getSession handles it
        if (event === "INITIAL_SESSION") return;

        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await fetchRoles(u.id);
        } else {
          setIsAdmin(false);
          setIsPartner(false);
        }
        if (mountedRef.current) setLoading(false);
      }
    );

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
