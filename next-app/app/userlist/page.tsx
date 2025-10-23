"use client";

import React, { useEffect, useState } from "react";
import useAuth from "@/app/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield } from "lucide-react";
import { getUsers, getUserRoles, getAvailableRoles, addUserRole, removeUserRole } from "@/lib/api";

interface Role {
  id: string;
  name: string;
  description?: string;
}

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
  const { user } = useAuth();
  const [users, setUsers] = useState<KeycloakUser[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, Role[]>>({});
  const [availableRoles, setAvailableRoles] = useState<Record<string, Role[]>>({});
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== "Admin") return;

    (async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        const rolesPromises = data.map(async (u: any) => {
          const [roles, available] = await Promise.all([getUserRoles(u.id), getAvailableRoles(u.id)]);
          return { id: u.id, roles, available };
        });

        const results = await Promise.all(rolesPromises);
        const rolesMap: Record<string, Role[]> = {};
        const availableMap: Record<string, Role[]> = {};
        results.forEach((r) => {
          rolesMap[r.id] = r.roles;
          availableMap[r.id] = r.available;
        });

        setUserRoles(rolesMap);
        setAvailableRoles(availableMap);
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.role]);

  async function handleRoleToggle(userId: string, role: Role, assigned: boolean) {
    setUpdatingUserId(userId);
    try {
      if (assigned) {
        await removeUserRole(userId, role);
      } else {
        await addUserRole(userId, role);
      }

      const currentRoles = userRoles[userId] || [];
      const newRoles = assigned ? currentRoles.filter((r) => r.id !== role.id) : [...currentRoles, role];

      setUserRoles((prev) => ({ ...prev, [userId]: newRoles }));
      if (assigned) {
        setAvailableRoles((prev) => ({
          ...prev,
          [userId]: [...(prev[userId] || []), role],
        }));
      } else {
        setAvailableRoles((prev) => ({
          ...prev,
          [userId]: (prev[userId] || []).filter((r) => r.id !== role.id),
        }));
      }
    } catch (err) {
      console.error("Failed to update roles:", err);
    } finally {
      setUpdatingUserId(null);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary" /> User Management
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => {
          const roles = userRoles[u.id] || [];
          const available = availableRoles[u.id] || [];

          return (
            <Card key={u.id} className="hover:shadow-md border border-gray-200 transition-all">
              <CardHeader className="flex flex-row items-center gap-3">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${u.username}`} />
                  <AvatarFallback>{u.username?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {u.firstName || u.username} {u.lastName || ""}
                  </CardTitle>
                  <CardDescription>{u.email || "No email"}</CardDescription>
                  <CardDescription>{u.username || "No user name"}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <Badge variant={u.enabled ? "default" : "destructive"} className="mt-2">
                    {u.enabled ? "Active" : "Disabled"}
                  </Badge>
                  <span className="text-sm text-gray-600">{u.emailVerified ? "Verified" : "Unverified"}</span>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-800 mb-1">Assigned Roles</h4>
                  {roles.length === 0 ? (
                    <p className="text-sm text-gray-500">No roles assigned</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {roles.map((role) => (
                        <Badge
                          key={role.id}
                          className="cursor-pointer bg-primary/80 hover:bg-red-100 hover:text-red-700 transition-colors"
                          onClick={() => handleRoleToggle(u.id, role, true)}
                        >
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-800 mb-1">Available Roles</h4>
                  {available.length === 0 ? (
                    <p className="text-sm text-gray-500">No available roles</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {available.map((role) => (
                        <Badge
                          key={role.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-green-100 hover:text-green-600 transition-colors"
                          onClick={() => handleRoleToggle(u.id, role, false)}
                        >
                          + {role.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>

              {updatingUserId === u.id && (
                <CardFooter>
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500 ml-2">Updating roles...</span>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
