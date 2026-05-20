import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "analyst" | "inspector" | "viewer";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string | null;
  department: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: UserRole[];
  isLoading: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo profile for guest mode
const guestProfile: Profile = {
  id: "guest-profile-id",
  user_id: "guest-user-id",
  full_name: "Visitante",
  email: "visitante@sema.gov.br",
  phone: null,
  position: "Explorador do Sistema",
  department: "Acesso Público",
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const isStaff = isGuest || roles.some(r => ["admin", "analyst", "inspector"].includes(r));
  const isAdmin = !isGuest && roles.includes("admin");

  useEffect(() => {
    // Check if guest mode was active
    const guestMode = localStorage.getItem("sema_guest_mode");
    if (guestMode === "true") {
      setIsGuest(true);
      setProfile(guestProfile);
      setIsLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserData(userId: string) {
    try {
      const [profileResult, rolesResult] = await Promise.all([
        (supabase as any)
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
        (supabase as any)
          .from("user_roles")
          .select("role")
          .eq("user_id", userId),
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data as Profile);
      }
      if (rolesResult.data) {
        setRoles(rolesResult.data.map((r: any) => r.role as UserRole));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setIsGuest(false);
    localStorage.removeItem("sema_guest_mode");
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
  }

  async function signOut() {
    if (isGuest) {
      exitGuestMode();
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  }

  function enterGuestMode() {
    setIsGuest(true);
    setProfile(guestProfile);
    setRoles([]);
    localStorage.setItem("sema_guest_mode", "true");
  }

  function exitGuestMode() {
    setIsGuest(false);
    setProfile(null);
    setRoles([]);
    localStorage.removeItem("sema_guest_mode");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        isLoading,
        isStaff,
        isAdmin,
        isGuest,
        signIn,
        signUp,
        signOut,
        enterGuestMode,
        exitGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
