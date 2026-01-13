import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type AppSettings = z.infer<typeof api.settings.list.responses[200]>;
type UpdateSetting = z.infer<typeof api.settings.update.input>;

export function useSettings() {
  return useQuery<AppSettings>({
    queryKey: [api.settings.list.path],
    queryFn: async () => {
      const res = await fetch(api.settings.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch settings");
      return await res.json();
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateSetting) => {
      const res = await fetch(api.settings.update.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update setting");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.list.path] });
      toast({ title: "Setting Updated" });
    },
  });
}
