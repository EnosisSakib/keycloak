"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addRole } from "@/lib/api";

export function AddRoleDialog({ open, onClose, onAdded }: any) {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!roleName) return;
    setLoading(true);
    try {
      console.log(roleName, description);
      await addRole(roleName, description);
      onAdded();
      onClose();
      setRoleName("");
      setDescription("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Role Name</Label>
            <Input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Enter role name"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
