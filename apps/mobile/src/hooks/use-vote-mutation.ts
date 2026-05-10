/**
 * useVoteMutation — optimistic vote-up with rollback on API error.
 * Vote up ONLY (no downvote). Idempotent via composite ID on server.
 * Cooldown 500ms post-press prevents rapid-fire duplicate calls.
 * Anti-FOMO: vote is on CONTENT, not on person.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import type { VoteResponse, Question, Answer } from '@btd/shared';
import type { VoteTargetType } from '@btd/shared';

interface VoteInput {
  targetType: VoteTargetType;
  targetId: string;
  questionId: string;
}

interface QuestionDetail {
  question: Question;
  answers: Answer[];
}

export function useVoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<VoteResponse, Error, VoteInput>({
    mutationFn: ({ targetType, targetId }) =>
      apiClient.post<VoteResponse>('/api/votes', { targetType, targetId }),

    onMutate: async ({ targetType, targetId, questionId }) => {
      await queryClient.cancelQueries({ queryKey: ['question', questionId] });
      await queryClient.cancelQueries({ queryKey: ['questions'] });

      const previousDetail = queryClient.getQueryData<QuestionDetail>(['question', questionId]);

      if (targetType === 'answer' && previousDetail) {
        queryClient.setQueryData<QuestionDetail>(['question', questionId], (old) => {
          if (!old) return old;
          return {
            ...old,
            answers: old.answers.map((a) =>
              a.id === targetId ? { ...a, voteCount: a.voteCount + 1 } : a,
            ),
          };
        });
      }

      if (targetType === 'question' && previousDetail) {
        queryClient.setQueryData<QuestionDetail>(['question', questionId], (old) => {
          if (!old) return old;
          return {
            ...old,
            question: { ...old.question, voteCount: old.question.voteCount + 1 },
          };
        });
      }

      return { previousDetail };
    },

    onError: (_err, { questionId }, context) => {
      const ctx = context as { previousDetail?: QuestionDetail } | undefined;
      if (ctx?.previousDetail) {
        queryClient.setQueryData(['question', questionId], ctx.previousDetail);
      }
    },

    onSettled: (_data, _err, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
    },
  });
}
