import type { User, UserRole } from "@/src/types";
import { store } from "@/src/data/store";

export interface LoginResult {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
}

export interface RegisterInput {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  enterpriseId?: string;
}

function generateToken(userId: string): string {
  return `mock_token_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const TOKEN_KEY = "scf_auth_token";
const USER_KEY = "scf_auth_user";

export function extractToken(tokenValue: string | undefined): string | undefined {
  return tokenValue;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const users = await store.users.filter((u) => u.username === username);
  const user = users[0];

  if (!user) {
    return { success: false, message: "用户不存在" };
  }
  if (user.password !== password) {
    return { success: false, message: "密码错误" };
  }

  const token = generateToken(user.id);
  store.setCurrentUser(user.id);

  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  const { password: _p, ..._safeUser } = user;
  void _p;
  return { success: true, user, token };
}

export async function logout(_token?: string): Promise<void> {
  store.setCurrentUser(undefined);
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export async function getCurrentUser(_token?: string): Promise<User | undefined> {
  const cachedId = store.getCurrentUserId();
  if (cachedId) {
    return store.users.get(cachedId);
  }
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as User;
        store.setCurrentUser(parsed.id);
        return parsed;
      } catch {
      }
    }
  }
  return undefined;
}

export function getToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(TOKEN_KEY) || undefined;
}

export async function register(input: RegisterInput): Promise<LoginResult> {
  const existing = await store.users.filter((u) => u.username === input.username);
  if (existing.length > 0) {
    return { success: false, message: "用户名已存在" };
  }
  const newUser: User = {
    id: `u_${Date.now()}`,
    username: input.username,
    password: input.password,
    role: input.role,
    name: input.name,
    enterpriseId: input.enterpriseId,
    createdAt: new Date().toISOString(),
  };
  await store.users.create(newUser);
  return login(input.username, input.password);
}

export async function updatePassword(
  userId: string,
  oldPwd: string,
  newPwd: string
): Promise<{ success: boolean; message?: string }> {
  const user = await store.users.get(userId);
  if (!user) return { success: false, message: "用户不存在" };
  if (user.password !== oldPwd) return { success: false, message: "原密码错误" };
  await store.users.update(userId, { password: newPwd });
  return { success: true };
}

export const AuthService = {
  extractToken,
  login,
  logout,
  register,
  getCurrentUser,
  getToken,
  updatePassword,
};

export default AuthService;
