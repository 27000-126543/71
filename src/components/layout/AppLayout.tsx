"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "@/src/context/AuthContext";
import type { UserRole } from "@/src/types";

interface AppLayoutProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export default function AppLayout({ children, requiredRoles }: AppLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [user, isLoading, requiredRoles, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-500 to-navy-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400 mx-auto mb-4"></div>
          <p className="text-gold-300 mt-4">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user.role} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
