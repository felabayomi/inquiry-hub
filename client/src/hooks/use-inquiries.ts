import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type InquiryWithReflections = z.infer<typeof api.inquiries.get.responses[200]>;
type UpsertInquiryInput = z.infer<typeof api.inquiries.upsert.input>;
type CreateReflectionInput = z.infer<typeof api.reflections.create.input>;

export function useMyInquiry() {
  return useQuery<InquiryWithReflections>({
    queryKey: [api.inquiries.get.path],
    queryFn: async () => {
      const res = await fetch(api.inquiries.get.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) throw new Error("Inquiry not found");
        throw new Error("Failed to fetch inquiry");
      }
      return await res.json();
    },
    retry: false,
  });
}

export function useUpsertInquiry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpsertInquiryInput) => {
      const res = await fetch(api.inquiries.upsert.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save inquiry");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.inquiries.get.path] });
      toast({ title: "Success", description: "Inquiry updated successfully." });
    },
  });
}

export function useCreateReflection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateReflectionInput) => {
      const res = await fetch(api.reflections.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add reflection");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.inquiries.get.path] });
      toast({ title: "Reflection Added", description: "Your weekly reflection has been saved." });
    },
  });
}
