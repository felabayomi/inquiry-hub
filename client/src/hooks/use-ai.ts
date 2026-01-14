import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface EvidenceItem {
  chunkId: number;
  sourceType: string;
  sourceId?: number;
  sectionId?: number;
  excerpt: string;
  authorName?: string;
}

export interface AiSummaryOutput {
  highLevelSummary: string;
  keyThemes: string[];
  notableQuotes: { text: string; chunkId: number; sourceType?: string; sourceId?: number }[];
  openQuestions: string[];
  recommendedNextSteps: string[];
  evidence: EvidenceItem[];
}

export interface AiSummary {
  id: number;
  type: string;
  scope: string;
  userId?: number;
  sectionId?: number;
  timeRangeStart?: string;
  timeRangeEnd?: string;
  content: AiSummaryOutput;
  evidenceChunkIds?: number[];
  generatedAt: string;
}

export interface AiSettings {
  userId: number;
  includePrivateInAI: boolean;
}

export function useAiSettings() {
  return useQuery<AiSettings>({
    queryKey: ['/api/ai/settings'],
  });
}

export function useUpdateAiSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: { includePrivateInAI: boolean }) => {
      const res = await apiRequest('PATCH', '/api/ai/settings', { includePrivateInAI: settings.includePrivateInAI });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/settings'] });
    },
  });
}

export function useGenerateJourneySummary() {
  const queryClient = useQueryClient();
  return useMutation<AiSummaryOutput>({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/ai/journey-summary');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/summaries'] });
    },
  });
}

export function useGenerateSectionSynthesis() {
  const queryClient = useQueryClient();
  return useMutation<AiSummaryOutput, Error, number>({
    mutationFn: async (sectionId: number) => {
      const res = await apiRequest('POST', `/api/ai/section-synthesis/${sectionId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/summaries'] });
    },
  });
}

export function useAiSummaries(type?: string) {
  return useQuery<AiSummary[]>({
    queryKey: ['/api/ai/summaries', type],
    queryFn: async () => {
      const url = type ? `/api/ai/summaries?type=${type}` : '/api/ai/summaries';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch summaries');
      return res.json();
    },
  });
}

export function useSectionSummaries(sectionId: number) {
  return useQuery<AiSummary[]>({
    queryKey: ['/api/ai/section-summaries', sectionId],
    enabled: !!sectionId,
  });
}
