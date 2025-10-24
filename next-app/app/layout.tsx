"use client";

import React from "react";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopBar } from "@/components/app-topbar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import "./globals.css";
import useAuth from "./useAuth";
import keycloak from "@/lib/keycloak";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLogin, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <AppTopBar
        appName="Project Sync"
        user={{
          name: user?.name || "",
          role: user?.role || "",
          isLoggedIn: true,
        }}
        onLogout={logout}
      />
      <SidebarProvider>
        <div className="flex flex-col min-h-screen">
          <div className="flex flex-1">
            <AppSidebar />
            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
              <SidebarTrigger />
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <ReactKeycloakProvider
          authClient={keycloak}
          initOptions={{
            onLoad: "check-sso",
            silentCheckSsoRedirectUri: typeof window !== "undefined" ? `${window.location.origin}/silent-check-sso.html` : undefined,
            checkLoginIframe: false,
          }}
          autoRefreshToken={true}
        >
          <AppLayoutContent>{children}</AppLayoutContent>
        </ReactKeycloakProvider>
      </body>
    </html>
  );
}
