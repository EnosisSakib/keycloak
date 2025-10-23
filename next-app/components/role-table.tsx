"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { fetchRoles } from "@/lib/api";

export function RoleTable({ onAddClick }: { onAddClick: () => void }) {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles()
      .then(setRoles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl font-semibold">Keycloak Roles</CardTitle>
        <Button onClick={onAddClick}>Add Role</Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : roles.length === 0 ? (
          <p className="text-muted-foreground">No roles found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
