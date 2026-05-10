/**
 * use-promote-message-to-forum-qa — TanStack mutation calling
 * POST /api/messages/:id/promote (Phase 2 endpoint).
 *
 * On success: returns questionId so caller can navigate to
 * Forum Q&A screen with the new question prefilled.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/api-client';

interface PromoteResponse {
  questionId: string;
}

export function usePromoteMessageToForumQa(channelId: string) {
  const queryClient = useQueryClient();

  return useMutation<PromoteResponse, Error, { messageId: string }>({
    mutationFn: ({ messageId }) =>
      apiClient.post<PromoteResponse>(`/api/messages/${messageId}/promote`, {}),

    onSuccess: () => {
      // Invalidate questions list so Forum Q&A screen refreshes
      void queryClient.invalidateQueries({ queryKey: ['questions'] });
      console.debug('[promote] channelId', channelId);
    },
  });
}
