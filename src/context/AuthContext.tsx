"use client";

import * as React from "react";
import type { User, UserRole } from "@/src/types";

const STORAGE_KEY = "scf_auth_user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

export function getRoleDashboardPath(role: UserRole): string {
  const pathMap: Record<UserRole, string> = {
    core_enterprise: "/enterprise/workbench",
    supplier: "/supplier/workbench",
    relationship_manager: "/approval/workbench",
    risk_director: "/approval/workbench",
    credit_committee: "/approval/workbench",
    admin: "/dashboard",
  };
  return pathMap[role] || "/login";
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

function safeUser(u: any): any {
  if (!u) return u;
  const { password, ...rest } = u;
  return rest;
}

async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.data) {
      return safeUser(data.data) as User;
    }
    return null;
  } catch {
    return null;
  }
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function init() {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setUser(safeUser(parsed) as User);
          } catch {
          }
        }
      }

      const currentUser = await getCurrentUser();
      if (cancelled) return;

      if (currentUser) {
        setUser(currentUser);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser(currentUser)));
        }
      } else {
        setUser(null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsLoading(false);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = React.useCallback(
    async (username: string, password: string): Promise<User> => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "登录失败");
      }

      const loggedInUser = safeUser(data.data.user) as User;
      setUser(loggedInUser);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
      }

      return loggedInUser;
    },
    []
  );

  const logout = React.useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
    }
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const hasRole = React.useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user]
  );

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      hasRole,
    }),
    [user, isLoading, login, logout, hasRole]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth 必须在 AuthProvider 内部使用");
  }
  return context;
}

export { AuthProvider, useAuth };
