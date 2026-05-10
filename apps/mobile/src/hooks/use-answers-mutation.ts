/**
 * useCreateAnswerMutation — POST /api/questions/:id/answers
 * useChooseAnswerMutation — PATCH /api/questions/:id/chosen-answer (author-only, server enforces 403)
 * useCreateQuestionMutation — POST /api/questions
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import type { Answer, Question, Truc, DepthTag } from '@btd/shared';

// ── Create answer ─────────────────────────────────────────────────────────────

interface CreateAnswerInput {
  questionId: string;
  body: string;
}

export function useCreateAnswerMutation() {
  const queryClient = useQueryClient();
  return useMutation<Answer, Error, CreateAnswerInput>({
    mutationFn: ({ questionId, body }) =>
      apiClient.post<Answer>(`/api/questions/${questionId}/answers`, { body }),
    onSuccess: (_data, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

// ── Choose answer (question author only — server returns 403 otherwise) ───────

interface ChooseAnswerInput {
  questionId: string;
  answerId: string;
}

export function useChooseAnswerMutation() {
  const queryClient = useQueryClient();
  return useMutation<Question, Error, ChooseAnswerInput>({
    mutationFn: ({ questionId, answerId }) =>
      apiClient.patch<Question>(`/api/questions/${questionId}/chosen-answer`, { answerId }),
    onSuccess: (_data, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
    },
  });
}

// ── Create question ───────────────────────────────────────────────────────────

interface CreateQuestionInput {
  title: string;
  body: string;
  truc: Truc;
  depthTag: DepthTag;
  promotedFromMessageId?: string;
}

export function useCreateQuestionMutation() {
  const queryClient = useQueryClient();
  return useMutation<Question, Error, CreateQuestionInput>({
    mutationFn: (payload) => apiClient.post<Question>('/api/questions', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}
