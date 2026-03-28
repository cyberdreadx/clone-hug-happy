import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPartner, setIsPartner] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", u.id);
          setIsAdmin(roles?.some((r) => r.role === "admin") ?? false);
          setIsPartner(roles?.some((r) => r.role === "partner") ?? false);
        } else {
          setIsAdmin(false);
          setIsPartner(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", u.id)
          .then(({ data: roles }) => {
            setIsAdmin(roles?.some((r) => r.role === "admin") ?? false);
            setIsPartner(roles?.some((r) => r.role === "partner") ?? false);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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
