"use client";

import React from "react";
import useAuth from "@/app/useAuth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, isLogin } = useAuth();

  if (!isLogin)
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card className="p-6 w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Access Denied</CardTitle>
            <CardDescription>Please log in to view your profile.</CardDescription>
          </CardHeader>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Go to Login
          </Button>
        </Card>
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-6">
      <Card className="w-full max-w-lg shadow-md">
        <CardHeader className="flex flex-col items-center text-center space-y-2">
          <Avatar className="w-20 h-20">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.name}`}
            />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-semibold">
            {user?.name || "Unknown User"}
          </CardTitle>
          <CardDescription>
            {user?.email || "No email provided"}
          </CardDescription>
          <Badge variant={user?.role === "Admin" ? "default" : "secondary"}>
            {user?.role}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-3 text-gray-700">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span>
              <strong>Name:</strong> {user?.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <span>
              <strong>Email:</strong> {user?.email}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>
              <strong>Role:</strong> {user?.role}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
