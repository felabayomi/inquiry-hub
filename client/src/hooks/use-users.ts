import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export function useUsers() {
  return useQuery<User[]>({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.users.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return await res.json();
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, isAdmin }: { id: number; isAdmin: boolean }) => {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update user role");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({ title: "User role updated" });
    },
    onError: () => {
      toast({ title: "Failed to update user role", variant: "destructive" });
    },
  });
}

export function useUpdateUserPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) => {
      const res = await fetch(`/api/admin/users/${id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update password");
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Password updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update password", variant: "destructive" });
    },
  });
}
