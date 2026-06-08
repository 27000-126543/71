"use client";

import * as React from "react";
import type { User, UserRole } from "@/src/types";
import { userRoleText } from "@/src/lib/utils";

/**
 * localStorage 存储 key
 */
const STORAGE_KEY = "scf_auth_user";

/**
 * 模拟用户数据
 */
const MOCK_USERS: User[] = [
  {
    id: "user-1",
    username: "admin",
    password: "123456",
    role: "admin",
    name: "系统管理员",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    username: "manager",
    password: "123456",
    role: "relationship_manager",
    name: "张经理",
    enterpriseId: "ent-1",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-3",
    username: "risk",
    password: "123456",
    role: "risk_director",
    name: "李风控",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-4",
    username: "supplier",
    password: "123456",
    role: "supplier",
    name: "王供应商",
    enterpriseId: "ent-2",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-5",
    username: "core",
    password: "123456",
    role: "core_enterprise",
    name: "赵核心",
    enterpriseId: "ent-1",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-6",
    username: "credit",
    password: "123456",
    role: "credit_committee",
    name: "陈授信",
    createdAt: "2024-01-01T00:00:00Z",
  },
];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

/**
 * 根据用户角色获取对应的仪表盘路径
 * @param role 用户角色
 */
export function getRoleDashboardPath(role: UserRole): string {
  const pathMap: Record<UserRole, string> = {
    core_enterprise: "/dashboard/core",
    supplier: "/dashboard/supplier",
    relationship_manager: "/dashboard/manager",
    risk_director: "/dashboard/risk",
    credit_committee: "/dashboard/credit",
    admin: "/dashboard/admin",
  };
  return pathMap[role] || "/login";
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * 认证上下文提供者
 * 提供用户登录状态、登录登出功能及 localStorage 持久化
 */
function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const stored = typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEY)
      : null;
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * 登录方法
   * @param username 用户名
   * @param password 密码
   * @returns 登录成功的用户信息
   * @throws 用户名或密码错误时抛出异常
   */
  const login = React.useCallback(
    async (username: string, password: string): Promise<User> => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const foundUser = MOCK_USERS.find(
        (u) => u.username === username && u.password === password
      );

      if (!foundUser) {
        throw new Error("用户名或密码错误");
      }

      const { password: _password, ...safeUser } = foundUser;
      const userToStore = foundUser;

      setUser(userToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userToStore));
      }

      return safeUser as User;
    },
    []
  );

  /**
   * 登出方法
   * 清除内存和 localStorage 中的用户信息
   */
  const logout = React.useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /**
   * 检查当前用户是否拥有指定角色
   * @param roles 单个角色或角色数组
   */
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

/**
 * 获取认证上下文的 Hook
 * @returns AuthContextType
 * @throws 必须在 AuthProvider 内部使用
 */
function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth 必须在 AuthProvider 内部使用");
  }
  return context;
}

export { AuthProvider, useAuth, MOCK_USERS };
