/**
 * useQuestions — TanStack infinite query for GET /api/questions
 * useQuestion — single question + answers
 * Filters: truc, depthTag (CONTENT depth — NOT user level)
 * Sort: newest | top | unsolved | mine
 */
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import type { Question, Answer } from '@btd/shared';
import type { DepthTag, Truc } from '@btd/shared';

export type QuestionSort = 'newest' | 'top' | 'unsolved' | 'mine';

export interface QuestionsFilter {
  truc?: Truc;
  depthTag?: DepthTag;
  sort: QuestionSort;
}

interface QuestionPage {
  items: Question[];
  nextCursor: string | null;
}

interface QuestionDetail {
  question: Question;
  answers: Answer[];
}

const PAGE_SIZE = 20;

// ── Mock data for dev mode when backend not deployed ─────────────────────────

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    authorUid: 'uid-linh-an',
    authorNickname: 'Linh An',
    title: 'Khi giảm cấp 2 từ 5→3 bữa, tôi mất ngủ — bình thường không?',
    body: 'Bắt đầu giảm bữa từ thứ 2 tuần trước. Đêm 3-4 ngủ chập chờn, tỉnh lúc 3h sáng không ngủ lại được. Đo nhịp tim đêm cao hơn baseline 8-12 bpm. Ngày tỉnh táo bình thường, không đói rõ. Có ai đi qua giai đoạn này chưa và mất bao lâu để baseline reset?',
    truc: 1,
    depthTag: 'co-ban',
    voteCount: 23,
    answerCount: 4,
    chosenAnswerId: 'a1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'q2',
    authorUid: 'uid-hong-van',
    authorNickname: 'Hồng Vân',
    title: 'Tiểu Linh nhi có thể bị bắt bởi "lực kéo lòng từ bi" — cụ thể là gì?',
    body: 'Đọc ghi chú của Đăng nói về lực kéo này nhưng chưa rõ cơ chế. Là cảm xúc thương hại làm linh hồn vướng lại? Hay là entity khác?',
    truc: 2,
    depthTag: 'nang-cao',
    voteCount: 17,
    answerCount: 6,
    chosenAnswerId: null,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'q3',
    authorUid: 'uid-thanh-phong',
    authorNickname: 'Thanh Phong',
    title: 'Phá chủ nô "ông bà lạc hậu" — làm sao không xung đột với cha mẹ?',
    body: 'Ở chung nhà với cha mẹ, niềm tin khác nhau. Mỗi lần nói chuyện đều thành cãi. Tách hành vi vs niềm tin có thực sự work không, hay chỉ là né tránh?',
    truc: 3,
    depthTag: 'di-sau',
    voteCount: 31,
    answerCount: 9,
    chosenAnswerId: 'a5',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'q4',
    authorUid: 'uid-trang-nha',
    authorNickname: 'Trang Nhã',
    title: 'Thái Dương Quyền sáng vs tối — khác nhau thế nào về kỹ thuật?',
    body: 'Mình đã tập 2 tuần buổi sáng. Có người trong kênh nói tối hiệu quả hơn cho phá nô lệ. Khác biệt cụ thể về hô hấp, tư thế, năng lượng huy động?',
    truc: 1,
    depthTag: 'di-sau',
    voteCount: 12,
    answerCount: 3,
    chosenAnswerId: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_ANSWERS: Answer[] = [
  {
    id: 'a1',
    questionId: 'q1',
    authorUid: 'uid-linh-an-2',
    authorNickname: 'Linh An',
    body: 'Mình đi qua giai đoạn này tháng 3. Mất ngủ 2 tuần rồi tự ổn. Cơ thể đang reset baseline insulin — đêm gan release glucose lúc 3h là phản ứng adaptive khi không có bữa tối. Sau ~10-14 ngày liver thích nghi, ngủ về lại bình thường. Đo: nhịp tim đêm của mình từ +10 bpm xuống về baseline ngày 12. Lưu ý: nếu kéo dài hơn 3 tuần thì nên tăng lại 4 bữa, có thể giảm quá nhanh.',
    voteCount: 18,
    isChosen: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a2',
    questionId: 'q1',
    authorUid: 'uid-dang',
    authorNickname: 'Đăng',
    body: 'Bổ sung góc khác: kiểm tra giờ bữa cuối. Nếu bạn ăn bữa cuối <5h trước khi ngủ, insulin còn cao đêm → khi nó drop sẽ kích thích cortisol → thức 3h. Mình dời bữa cuối về 16h thay vì 19h, mất ngủ giảm rõ sau 4 ngày. Variable này quan trọng hơn số bữa.',
    voteCount: 12,
    isChosen: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'a3',
    questionId: 'q1',
    authorUid: 'uid-bich-ngoc',
    authorNickname: 'Bích Ngọc',
    body: 'Mình mất ngủ 3 tuần, không tự ổn. Phải tăng lại 4 bữa. Có thể không phải ai cũng giảm 5→3 thẳng được. Khuyến nghị: 5→4 hai tuần, rồi 4→3. Đo theo cơ thể mình.',
    voteCount: 7,
    isChosen: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'a4',
    questionId: 'q1',
    authorUid: 'uid-thanh-phong',
    authorNickname: 'Thanh Phong',
    body: 'Thêm data point: mình giảm 5→3 trong 1 tuần, mất ngủ chỉ 4 đêm. Khác biệt: mình tập Thái Dương Quyền sáng + đi bộ 10k bước/ngày. Vận động giúp insulin sensitivity tăng nhanh hơn. Có thể bạn thử thêm vận động.',
    voteCount: 4,
    isChosen: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

const IS_DEV_MOCK = typeof __DEV__ !== 'undefined' && __DEV__;

// ── useQuestions ─────────────────────────────────────────────────────────────

export function useQuestions(filter: QuestionsFilter) {
  return useInfiniteQuery<QuestionPage, Error>({
    queryKey: ['questions', filter],
    queryFn: async ({ pageParam }) => {
      if (IS_DEV_MOCK) {
        let items = [...MOCK_QUESTIONS];
        if (filter.truc) items = items.filter((q) => q.truc === filter.truc);
        if (filter.depthTag) items = items.filter((q) => q.depthTag === filter.depthTag);
        if (filter.sort === 'top') items.sort((a, b) => b.voteCount - a.voteCount);
        if (filter.sort === 'unsolved') items = items.filter((q) => !q.chosenAnswerId);
        return { items, nextCursor: null };
      }

      const params = new URLSearchParams();
      if (filter.truc) params.set('truc', String(filter.truc));
      if (filter.depthTag) params.set('depthTag', filter.depthTag);
      const sortMap: Record<QuestionSort, string> = {
        newest: 'newest',
        top: 'top',
        unsolved: 'newest',
        mine: 'newest',
      };
      params.set('sort', sortMap[filter.sort]);
      params.set('limit', String(PAGE_SIZE));
      if (pageParam) params.set('cursor', pageParam as string);
      if (filter.sort === 'mine') params.set('mine', 'true');
      if (filter.sort === 'unsolved') params.set('unsolved', 'true');

      return apiClient.get<QuestionPage>(`/api/questions?${params.toString()}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 2 * 60 * 1000,
  });
}

// ── useQuestion (single + answers) ───────────────────────────────────────────

export function useQuestion(id: string) {
  return useQuery<QuestionDetail, Error>({
    queryKey: ['question', id],
    queryFn: async () => {
      if (IS_DEV_MOCK) {
        const question = MOCK_QUESTIONS.find((q) => q.id === id) ?? MOCK_QUESTIONS[0];
        const answers = MOCK_ANSWERS.filter((a) => a.questionId === question.id);
        return { question, answers };
      }
      return apiClient.get<QuestionDetail>(`/api/questions/${id}`);
    },
    enabled: !!id,
  });
}
