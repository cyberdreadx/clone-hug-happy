import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const initialized = useRef(false);

  const fetchRoles = useCallback(async (userId: string) => {
    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      setIsAdmin(roles?.some((r) => r.role === "admin") ?? false);
      setIsPartner(roles?.some((r) => r.role === "partner") ?? false);
    } catch {
      setIsAdmin(false);
      setIsPartner(false);
    }
  }, []);

  useEffect(() => {
    // Set up listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await fetchRoles(u.id);
        } else {
          setIsAdmin(false);
          setIsPartner(false);
        }
        setLoading(false);
        initialized.current = true;
      }
    );

    // Fallback: if onAuthStateChange hasn't fired within 2s, resolve loading
    const timeout = setTimeout(() => {
      if (!initialized.current) {
        setLoading(false);
      }
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [fetchRoles]);

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
