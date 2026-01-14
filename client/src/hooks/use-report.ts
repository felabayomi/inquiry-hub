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
type CreateSectionInput = z.infer<typeof api.report.createSection.input>;
type UpdateSectionInput = z.infer<typeof api.report.updateSection.input>;
type JusticeLensesList = z.infer<typeof api.justiceLenses.list.responses[200]>;
type CreateJusticeLensInput = z.infer<typeof api.justiceLenses.create.input>;
type UpdateJusticeLensInput = z.infer<typeof api.justiceLenses.update.input>;

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
      queryClient.invalidateQueries({ queryKey: ['/api/report/versions/engagement'] });
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

// Admin section management hooks
export function useCreateSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateSectionInput) => {
      const res = await fetch(api.report.createSection.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create section");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.report.sections.path] });
      toast({ title: "Section Created" });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSectionInput }) => {
      const res = await fetch(`/api/admin/report/sections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update section");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.report.sections.path] });
      toast({ title: "Section Updated" });
    },
    onError: () => {
      toast({ title: "Failed to update section", variant: "destructive" });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/report/sections/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete section");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.report.sections.path] });
      toast({ title: "Section Deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete section", variant: "destructive" });
    },
  });
}

// Justice Lenses
export function useJusticeLenses() {
  return useQuery<JusticeLensesList>({
    queryKey: [api.justiceLenses.list.path],
    queryFn: async () => {
      const res = await fetch(api.justiceLenses.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch justice lenses");
      return await res.json();
    },
  });
}

export function useCreateJusticeLens() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateJusticeLensInput) => {
      const res = await fetch(api.justiceLenses.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create justice lens");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.justiceLenses.list.path] });
      toast({ title: "Justice Lens Created" });
    },
    onError: () => {
      toast({ title: "Failed to create justice lens", variant: "destructive" });
    },
  });
}

export function useUpdateJusticeLens() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateJusticeLensInput }) => {
      const res = await fetch(`/api/admin/justice-lenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update justice lens");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.justiceLenses.list.path] });
      toast({ title: "Justice Lens Updated" });
    },
    onError: () => {
      toast({ title: "Failed to update justice lens", variant: "destructive" });
    },
  });
}

export function useDeleteJusticeLens() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/justice-lenses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete justice lens");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.justiceLenses.list.path] });
      toast({ title: "Justice Lens Deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete justice lens", variant: "destructive" });
    },
  });
}

// === ENGAGEMENT: READS & REACTIONS ===
export interface VersionWithEngagement {
  id: number;
  sectionId: number;
  userId: number;
  content: string;
  justiceLensTags: string[] | null;
  visibility: string | null;
  createdAt: string | null;
  author: { id: number; fullName: string; username: string };
  reads: { id: number; userId: number; user: { id: number; fullName: string } }[];
  reactions: { id: number; userId: number; reactionType: string; user: { id: number; fullName: string } }[];
}

export function useAllVersionsWithEngagement() {
  return useQuery<VersionWithEngagement[]>({
    queryKey: ['/api/report/versions/engagement'],
    queryFn: async () => {
      const res = await fetch('/api/report/versions/engagement', { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch versions with engagement");
      return await res.json();
    },
  });
}

export function useMyReadVersionIds() {
  return useQuery<number[]>({
    queryKey: ['/api/report/my-reads'],
    queryFn: async () => {
      const res = await fetch('/api/report/my-reads', { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch my reads");
      return await res.json();
    },
  });
}

export function useMarkVersionRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (versionId: number) => {
      const res = await fetch(`/api/report/versions/${versionId}/read`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/report/versions/engagement'] });
      queryClient.invalidateQueries({ queryKey: ['/api/report/my-reads'] });
    },
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ versionId, reactionType }: { versionId: number; reactionType: string }) => {
      const res = await fetch(`/api/report/versions/${versionId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to toggle reaction");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/report/versions/engagement'] });
    },
  });
}

export function useTotalUsersCount() {
  return useQuery<number>({
    queryKey: ['/api/cohort/user-count'],
    queryFn: async () => {
      const res = await fetch('/api/cohort/user-count', { credentials: "include" });
      if (!res.ok) return 5;
      const data = await res.json();
      return data.count || 5;
    },
  });
}
