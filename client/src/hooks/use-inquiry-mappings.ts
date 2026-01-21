import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { InquiryMapping, SectionLensMapping, SectionFocusContext, InsertInquiryMapping, InsertSectionLensMapping, InsertSectionFocusContext } from "@shared/schema";

export function useInquiryMappings() {
  return useQuery<InquiryMapping[]>({
    queryKey: ["/api/inquiry-mappings"],
  });
}

export function useActiveMapping() {
  return useQuery<InquiryMapping | null>({
    queryKey: ["/api/inquiry-mappings/active"],
  });
}

export function useSectionLensMappings(mappingId: number | undefined) {
  return useQuery<SectionLensMapping[]>({
    queryKey: ["/api/inquiry-mappings", mappingId, "sections"],
    queryFn: async () => {
      if (!mappingId) return [];
      const res = await fetch(`/api/inquiry-mappings/${mappingId}/sections`);
      if (!res.ok) throw new Error("Failed to fetch section mappings");
      return res.json();
    },
    enabled: !!mappingId,
  });
}

export function useCreateMapping() {
  return useMutation({
    mutationFn: async (data: InsertInquiryMapping) => {
      const res = await apiRequest("POST", "/api/inquiry-mappings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiry-mappings"] });
    },
  });
}

export function useUpdateMapping() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertInquiryMapping> }) => {
      const res = await apiRequest("PATCH", `/api/inquiry-mappings/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiry-mappings"] });
    },
  });
}

export function useDeleteMapping() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/inquiry-mappings/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiry-mappings"] });
    },
  });
}

export function useSetActiveMapping() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/inquiry-mappings/${id}/activate`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiry-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inquiry-mappings/active"] });
    },
  });
}

export function useSaveSectionMappings() {
  return useMutation({
    mutationFn: async ({ mappingId, mappings }: { mappingId: number; mappings: Omit<InsertSectionLensMapping, "mappingId">[] }) => {
      const res = await apiRequest("POST", `/api/inquiry-mappings/${mappingId}/sections`, mappings);
      return res.json();
    },
    onSuccess: (_, { mappingId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiry-mappings", mappingId, "sections"] });
    },
  });
}

export function useSectionFocusContexts(mappingId: number | undefined) {
  return useQuery<SectionFocusContext[]>({
    queryKey: ["/api/inquiry-mappings", mappingId, "focus-contexts"],
    queryFn: async () => {
      if (!mappingId) return [];
      const res = await fetch(`/api/inquiry-mappings/${mappingId}/focus-contexts`);
      if (!res.ok) throw new Error("Failed to fetch focus contexts");
      return res.json();
    },
    enabled: !!mappingId,
  });
}

export function useSaveFocusContexts() {
  return useMutation({
    mutationFn: async ({ mappingId, contexts }: { mappingId: number; contexts: Omit<InsertSectionFocusContext, "mappingId">[] }) => {
      const res = await apiRequest("POST", `/api/inquiry-mappings/${mappingId}/focus-contexts`, contexts);
      return res.json();
    },
    onSuccess: (_, { mappingId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiry-mappings", mappingId, "focus-contexts"] });
    },
  });
}
