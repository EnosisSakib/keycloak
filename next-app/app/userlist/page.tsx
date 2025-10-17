"use client";

import React, { useEffect, useState } from "react";
import useAuth from "@/app/useAuth";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, User as UserIcon, Shield } from "lucide-react";

interface KeycloakUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified: boolean;
  createdTimestamp: number;
}

export default function UserListPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<KeycloakUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "Admin") {
      router.push("/react-app/profile");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/users`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "Admin") fetchUsers();
  }, [token, user?.role]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );

  if (error)
    return (
      <div className="text-red-600 font-medium p-4 bg-red-50 border rounded-md">
        {error}
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary" /> User Management
      </h1>

      {users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <Card key={u.id} className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={`https://api.dicebear.com/9.x/initials/svg?seed=${u.username}`}
                  />
                  <AvatarFallback>
                    {u.username?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {u.firstName || u.username} {u.lastName || ""}
                  </CardTitle>
                  <CardDescription>{u.email || "No email"}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserIcon className="w-4 h-4" />
                  <span>{u.username}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>
                    {u.emailVerified ? "Email Verified" : "Email Not Verified"}
                  </span>
                </div>
                <Badge
                  variant={u.enabled ? "default" : "destructive"}
                  className="mt-2"
                >
                  {u.enabled ? "Active" : "Disabled"}
                </Badge>
              </CardContent>
              <CardFooter className="flex justify-end"></CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
