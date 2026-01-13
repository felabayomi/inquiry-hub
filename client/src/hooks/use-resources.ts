import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type ResourceList = z.infer<typeof api.resources.list.responses[200]>;
type CreateResourceInput = z.infer<typeof api.resources.create.input>;

export function useResources() {
  return useQuery<ResourceList>({
    queryKey: [api.resources.list.path],
    queryFn: async () => {
      const res = await fetch(api.resources.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch resources");
      return await res.json();
    },
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateResourceInput) => {
      const res = await fetch(api.resources.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add resource");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resources.list.path] });
      toast({ title: "Resource Shared", description: "Added to the cohort library." });
    },
  });
}
