"use client";
import { useState } from "react";
import { RoleTable } from "@/components/role-table";
import { AddRoleDialog } from "@/components/role-add-dialog";

export default function RolesPage() {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="p-8">
      <RoleTable key={refreshKey} onAddClick={() => setOpen(true)} />
      <AddRoleDialog
        open={open}
        onClose={() => setOpen(false)}
        onAdded={() => setRefreshKey((k) => k + 1)}
      />
    </main>
  );
}
