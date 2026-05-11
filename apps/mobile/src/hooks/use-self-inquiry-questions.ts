/**
 * useSelfInquiryQuestions — TanStack infinite query for GET /api/self-inquiry/questions
 * useSelfInquiryAnswers — parallel answers for a single question (Phone 3)
 * useTamKhaoMutation — save answer to user's personal library ("Tham khảo")
 *
 * Anti-patterns enforced:
 *   - Depth tags on QUESTION content only — never on user profiles
 *   - NO vote counts on users
 *   - NO follower counts anywhere
 */
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '../services/api-client';
import type { DepthTag } from '@btd/shared';

// ── Types ───────────────────────────────────────────────────────────────────

export type SelfInquiryFilter = {
  depthTag?: DepthTag | 'all';
  sort?: 'newest' | 'popular';
};

export interface SelfInquiryQuestion {
  id: string;
  content: string;                    // the question text
  depthTag: DepthTag;                 // content classification — NEVER user-level
  hướngDiCount: number;               // how many parallel answers exist
  createdAt: string;
}

export interface SelfInquiryAnswer {
  id: string;
  questionId: string;
  authorUid: string;
  authorNickname: string;
  authorCurrentFocus: string | null;  // practice state e.g. "Đang luyện cấp 1 68%"
  body: string;
  createdAt: string;
  // NO voteCount, NO follower count on author — peer equality enforced
}

interface QuestionsPage {
  items: SelfInquiryQuestion[];
  nextCursor: string | null;
}

const IS_DEV_MOCK = typeof __DEV__ !== 'undefined' && __DEV__;
const PAGE_SIZE = 20;

// ── Mock data ─────────────────────────────────────────────────────────────

export const MOCK_SELF_INQUIRY_QUESTIONS: SelfInquiryQuestion[] = [
  {
    id: 'sq1',
    content: 'Khi nào tôi hành động vì sợ hãi, chứ không phải vì yêu thương?',
    depthTag: 'co-ban',
    hướngDiCount: 7,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sq2',
    content: 'Chủ nô nào đang điều khiển tôi mà tôi gọi là "tính cách của mình"?',
    depthTag: 'di-sau',
    hướngDiCount: 12,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sq3',
    content: 'Điều gì tôi biết là đúng nhưng vẫn không làm?',
    depthTag: 'co-ban',
    hướngDiCount: 5,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sq4',
    content: 'Tiểu Linh Nhi của tôi đang bị giữ lại bởi điều gì?',
    depthTag: 'nang-cao',
    hướngDiCount: 9,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sq5',
    content: 'Khi tôi im lặng hoàn toàn, điều gì xuất hiện?',
    depthTag: 'di-sau',
    hướngDiCount: 3,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_SELF_INQUIRY_ANSWERS: SelfInquiryAnswer[] = [
  {
    id: 'sa1',
    questionId: 'sq2',
    authorUid: 'uid-dang',
    authorNickname: 'Đăng',
    authorCurrentFocus: 'Đang luyện cấp 1 68%',
    body: 'Với tôi là chủ nô "thiếu hiểu biết" — tôi cứ nghĩ mình cần đọc thêm 1 cuốn nữa trước khi hành động. Sau 10 năm mới nhận ra đó là né tránh được đóng gói thành "học hỏi".',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sa2',
    questionId: 'sq2',
    authorUid: 'uid-linh-an',
    authorNickname: 'Linh An',
    authorCurrentFocus: 'Đang luyện cấp 2 80%',
    body: 'Chủ nô "ông bà lạc hậu" — niềm tin rằng mình không xứng đáng thành công vì gia đình chưa ai làm được. Khi nào thành công tôi đều tự phá đi ngay sau.',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sa3',
    questionId: 'sq2',
    authorUid: 'uid-thanh-phong',
    authorNickname: 'Thanh Phong',
    authorCurrentFocus: 'Đang luyện cấp 2 60%',
    body: 'Định kiến — tôi luôn kết luận về người khác trước khi để họ nói xong. Rất khó nhận ra vì nó xảy ra chưa đến 1 giây.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sa4',
    questionId: 'sq2',
    authorUid: 'uid-hong-van',
    authorNickname: 'Hồng Vân',
    authorCurrentFocus: null,
    body: 'Tôi chưa xác định được rõ nhưng nhận thấy mình hay tìm kiếm sự đồng ý của người khác trước khi quyết định. Có thể là chủ nô "thiếu hiểu biết" kết hợp "ông bà lạc hậu".',
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
  },
];

// ── useSelfInquiryQuestions ────────────────────────────────────────────────

export function useSelfInquiryQuestions(filter: SelfInquiryFilter = {}) {
  return useInfiniteQuery<QuestionsPage, Error>({
    queryKey: ['self-inquiry-questions', filter],
    queryFn: async ({ pageParam }) => {
      if (IS_DEV_MOCK) {
        let items = [...MOCK_SELF_INQUIRY_QUESTIONS];
        if (filter.depthTag && filter.depthTag !== 'all') {
          items = items.filter((q) => q.depthTag === filter.depthTag);
        }
        if (filter.sort === 'popular') {
          items = items.sort((a, b) => b.hướngDiCount - a.hướngDiCount);
        }
        return { items, nextCursor: null };
      }

      const params = new URLSearchParams();
      if (filter.depthTag && filter.depthTag !== 'all') {
        params.set('depthTag', filter.depthTag);
      }
      if (filter.sort) params.set('sort', filter.sort);
      params.set('limit', String(PAGE_SIZE));
      if (pageParam) params.set('cursor', pageParam as string);

      return apiClient.get<QuestionsPage>(`/api/self-inquiry/questions?${params.toString()}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
  });
}

// ── useSelfInquiryAnswers ─────────────────────────────────────────────────

export function useSelfInquiryAnswers(questionId: string) {
  return useQuery<SelfInquiryAnswer[], Error>({
    queryKey: ['self-inquiry-answers', questionId],
    queryFn: async () => {
      if (IS_DEV_MOCK) {
        return MOCK_SELF_INQUIRY_ANSWERS.filter((a) => a.questionId === questionId);
      }
      return apiClient.get<SelfInquiryAnswer[]>(
        `/api/self-inquiry/questions/${questionId}/answers`,
      );
    },
    enabled: !!questionId,
    staleTime: 3 * 60 * 1000,
  });
}

// ── useTamKhaoMutation (save to personal library) ─────────────────────────

/**
 * "Tham khảo" = save an answer to the user's personal library.
 * NOT "đồng cảm" / NOT a social vote.
 */
export function useTamKhaoMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { answerId: string; questionId: string }>({
    mutationFn: async ({ answerId }) => {
      if (IS_DEV_MOCK) return;
      await apiClient.post(`/api/self-inquiry/saved`, { answerId });
    },
    onSuccess: (_data, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ['self-inquiry-answers', questionId] });
      queryClient.invalidateQueries({ queryKey: ['self-inquiry-saved'] });
    },
  });
}
