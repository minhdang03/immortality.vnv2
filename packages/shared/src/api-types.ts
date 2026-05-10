/**
 * TypeScript types for Bất Tử Đạo REST API — profiles, questions, answers, votes.
 * Derived from Firestore schema in docs/firestore-schema-btd-mobile.md.
 * Shared across: workers/api, apps/mobile, apps/web.
 */

// ── Primitive aliases ─────────────────────────────────────────────────────────

/** ISO-8601 timestamp string (Firestore timestampValue converted to JS) */
export type ISOTimestamp = string;

/** Firebase Auth UID */
export type UID = string;

// ── Domain types ──────────────────────────────────────────────────────────────

export type ChuNo =
  | "thieu-hieu-biet"
  | "ong-ba-lac-hau"
  | "dinh-kien"
  | "chu-no-giau-mat"
  | null;

export type DepthTag = "co-ban" | "di-sau" | "nang-cao";

/** Anti-tier topic axis: 1=Bẻ gãy thiếu hiểu biết, 2=Bẻ gãy ông bà lạc hậu, 3=Bẻ gãy định kiến */
export type Truc = 1 | 2 | 3;

export type CurrentFocus = {
  chuNo: ChuNo;
  capLuyen: number; // 0–100
  technique: string; // ≤100 chars
};

// ── Profile ───────────────────────────────────────────────────────────────────

/**
 * Public profile fields returned by GET /api/profiles/:uid.
 * Server strips isFounder, proExpiresAt, fcmTokens from public reads.
 */
export type Profile = {
  id: UID;
  nickname: string;
  avatarType: "gradient" | "photo";
  avatarSeed: string;
  photoUrl?: string;
  bio?: string;
  currentFocus?: CurrentFocus;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
};

/** Full profile — only accessible server-side or by admin, never returned to other clients */
export type ProfileFull = Profile & {
  isFounder?: boolean;
  proExpiresAt?: ISOTimestamp;
  fcmTokens?: string[];
};

// ── Question ──────────────────────────────────────────────────────────────────

export type Question = {
  id: string;
  authorUid: UID;
  authorNickname: string;
  title: string;
  body: string;
  truc: Truc;
  depthTag: DepthTag;
  voteCount: number;
  answerCount: number;
  chosenAnswerId?: string | null;
  promotedFromMessageId?: string | null;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
};

/** Lightweight question summary for list view (no vote count — anti-FOMO) */
export type QuestionSummary = Pick<
  Question,
  "id" | "authorNickname" | "title" | "truc" | "depthTag" | "answerCount" | "createdAt"
> & {
  hasChosenAnswer: boolean;
};

// ── Answer ────────────────────────────────────────────────────────────────────

export type Answer = {
  id: string;
  questionId: string;
  authorUid: UID;
  authorNickname: string;
  body: string;
  voteCount: number;
  isChosen: boolean;
  createdAt: ISOTimestamp;
};

// ── Vote ──────────────────────────────────────────────────────────────────────

export type VoteTargetType = "question" | "answer";

export type Vote = {
  /** Composite: `{targetType}_{targetId}_{voterUid}` */
  id: string;
  voterUid: UID;
  targetType: VoteTargetType;
  targetId: string;
  createdAt: ISOTimestamp;
};

// ── API Request / Response shapes ─────────────────────────────────────────────

export type PaginatedResponse<T> = {
  items: T[];
  nextCursor: string | null;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type VoteResponse = {
  voted: true;
  alreadyVoted: boolean;
};
