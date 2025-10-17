"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

interface User {
  name: string;
  role: string;
  isLoggedIn: boolean;
}

interface AppTopBarProps {
  appName: string;
  user: User;
  onLogout: () => void;
}

export function AppTopBar({ appName, user, onLogout }: AppTopBarProps) {
  return (
    <header className="relative w-full bg-white border-b border-gray-200 flex items-center justify-end px-6 h-16 sticky top-0 z-50 shadow-sm">
      {/* Center: App name */}
      <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-semibold text-gray-800">
        {appName}
      </h1>

      {/* Right: User info */}
      <div className="flex items-center space-x-4">
        {user.isLoggedIn ? (
          <>
            <div className="flex flex-col items-end text-right">
              <span className="font-medium text-gray-900">{user.name}</span>
              <span className="text-sm text-gray-500">{user.role}</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={onLogout}
              className="hover:bg-gray-50"
            >
              Logout
            </Button>
          </>
        ) : (
          <Button size="sm" className="hover:bg-gray-50">
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
