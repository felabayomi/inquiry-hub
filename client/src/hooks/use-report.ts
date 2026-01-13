import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type SectionsList = z.infer<typeof api.report.sections.responses[200]>;
type LatestVersion = z.infer<typeof api.report.latestVersions.responses[200]>;
type VersionHistory = z.infer<typeof api.report.history.responses[200]>;
type CommentsList = z.infer<typeof api.report.comments.responses[200]>;
type SaveVersionInput = z.infer<typeof api.report.saveVersion.input>;
type AddCommentInput = z.infer<typeof api.report.addComment.input>;

export function useReportSections() {
  return useQuery<SectionsList>({
    queryKey: [api.report.sections.path],
    queryFn: async () => {
      const res = await fetch(api.report.sections.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sections");
      return await res.json();
    },
  });
}

export function useLatestVersion(sectionId: number) {
  return useQuery<LatestVersion>({
    queryKey: [api.report.latestVersions.path, sectionId],
    queryFn: async () => {
      const url = buildUrl(api.report.latestVersions.path, { sectionId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch latest version");
      return await res.json();
    },
    enabled: !!sectionId,
  });
}

export function useVersionHistory(sectionId: number) {
  return useQuery<VersionHistory>({
    queryKey: [api.report.history.path, sectionId],
    queryFn: async () => {
      const url = buildUrl(api.report.history.path, { sectionId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch history");
      return await res.json();
    },
    enabled: !!sectionId,
  });
}

export function useSectionComments(sectionId: number) {
  return useQuery<CommentsList>({
    queryKey: [api.report.comments.path, sectionId],
    queryFn: async () => {
      const url = buildUrl(api.report.comments.path, { sectionId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch comments");
      return await res.json();
    },
    enabled: !!sectionId,
  });
}

export function useSaveVersion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: SaveVersionInput) => {
      const res = await fetch(api.report.saveVersion.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save draft");
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.report.latestVersions.path, variables.sectionId] });
      queryClient.invalidateQueries({ queryKey: [api.report.history.path, variables.sectionId] });
      toast({ title: "Draft Saved", description: "Your changes have been recorded." });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AddCommentInput) => {
      const res = await fetch(api.report.addComment.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.report.comments.path, variables.sectionId] });
      toast({ title: "Comment Added" });
    },
  });
}
