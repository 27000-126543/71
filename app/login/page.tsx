"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent } from "@/src/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { useAuth } from "@/src/context/AuthContext";
import { userRoleText } from "@/src/lib/utils";
import type { UserRole } from "@/src/types";
import { cn } from "@/src/lib/utils";

const roles: UserRole[] = [
  "core_enterprise",
  "supplier",
  "relationship_manager",
  "risk_director",
  "credit_committee",
  "admin",
];

const testAccounts: Record<UserRole, { username: string; password: string }> = {
  core_enterprise: { username: "core", password: "123456" },
  supplier: { username: "supplier", password: "123456" },
  relationship_manager: { username: "manager", password: "123456" },
  risk_director: { username: "risk", password: "123456" },
  credit_committee: { username: "credit", password: "123456" },
  admin: { username: "admin", password: "123456" },
};

const getRoleWorkbenchPath = (role: UserRole): string => {
  const pathMap: Record<UserRole, string> = {
    core_enterprise: "/enterprise/workbench",
    supplier: "/supplier/workbench",
    relationship_manager: "/approval/workbench",
    risk_director: "/approval/workbench",
    credit_committee: "/approval/workbench",
    admin: "/dashboard",
  };
  return pathMap[role] || "/login";
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = React.useState<UserRole>("core_enterprise");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const account = testAccounts[selectedRole];
    setUsername(account.username);
    setPassword(account.password);
  }, [selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("请输入账号和密码");
      return;
    }

    try {
      const user = await login(username.trim(), password);
      router.push(getRoleWorkbenchPath(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    }
  };

  const fillTestAccount = () => {
    const account = testAccounts[selectedRole];
    setUsername(account.username);
    setPassword(account.password);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 noise-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
      </div>

      <div
        className={cn(
          "relative w-full max-w-md transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-300 to-gold-500 shadow-glow mb-5 animate-pulse-glow">
            <Building2 className="w-12 h-12 text-navy-800" />
          </div>
          <h1 className="text-3xl font-serif font-bold glow-text mb-2">
            盛融供应链金融平台
          </h1>
          <p className="text-navy-200 text-sm">
            专业 · 安全 · 高效的供应链金融服务
          </p>
        </div>

        <div className="gold-line mb-6" />

        <Card className="bg-navy-700/60 backdrop-blur-xl border-gold-400/30 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-60" />
          <CardContent className="p-6">
            <Tabs
              defaultValue={selectedRole}
              value={selectedRole}
              onValueChange={(v) => setSelectedRole(v as UserRole)}
            >
              <TabsList className="grid grid-cols-3 w-full bg-navy-800/60 p-1 rounded-lg">
                {roles.map((role) => (
                  <TabsTrigger
                    key={role}
                    value={role}
                    className={cn(
                      "text-xs py-2 rounded-md transition-all",
                      selectedRole === role
                        ? "bg-gold-400 text-navy-900 font-semibold shadow-md"
                        : "text-navy-200 hover:text-white"
                    )}
                  >
                    {userRoleText(role)}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedRole} className="mt-6">
                {error && (
                  <Alert variant="danger" className="mb-5 bg-red-900/40 border-red-500/50">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-navy-100">账号</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="请输入账号"
                        className="pl-10 bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-navy-100">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="请输入密码"
                        className="pl-10 pr-10 bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-gold-400 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full mt-2 shadow-glow hover:shadow-lg hover:shadow-gold-400/30 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? "登录中..." : "登 录"}
                  </Button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={fillTestAccount}
                      className="text-gold-400 hover:text-gold-300 transition-colors"
                    >
                      填充测试账号
                    </button>
                    <Link
                      href="/register/core"
                      className="text-navy-200 hover:text-gold-400 transition-colors"
                    >
                      企业注册 →
                    </Link>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <div className="px-6 pb-6">
            <div className="text-center text-xs text-navy-300 bg-navy-800/40 rounded-lg p-3 border border-navy-600/50">
              <p className="mb-1">
                <span className="text-gold-400 font-medium">测试账号：</span>
                {testAccounts[selectedRole].username} / {testAccounts[selectedRole].password}
              </p>
              <p className="text-navy-400">当前角色：{userRoleText(selectedRole)}</p>
            </div>
          </div>
        </Card>

        <p className="text-center text-navy-400 text-xs mt-8">
          © 2024 盛融供应链金融平台 · 金融许可证编号：××××××
        </p>
      </div>
    </div>
  );
}
