// @btd/shared — types, i18n constants, and utilities shared across web + mobile

// API types (TypeScript interfaces matching Firestore schema)
export type {
  ISOTimestamp,
  UID,
  ChuNo,
  DepthTag,
  Truc,
  VoteTargetType,
  CurrentFocus,
  Profile,
  ProfileFull,
  Question,
  QuestionSummary,
  Answer,
  Vote,
  PaginatedResponse,
  ApiError,
  VoteResponse,
} from "./api-types.js";

// API Zod schemas (use for request/response validation on client + server)
export {
  ISOTimestampSchema,
  ChuNoSchema,
  DepthTagSchema,
  TrucSchema,
  VoteTargetTypeSchema,
  CurrentFocusSchema,
  ProfileSchema,
  ProfileCreateSchema,
  ProfilePatchSchema,
  QuestionSchema,
  QuestionSummarySchema,
  QuestionCreateSchema,
  QuestionListQuerySchema,
  ChosenAnswerSchema,
  AnswerSchema,
  AnswerCreateSchema,
  VoteCreateSchema,
  VoteResponseSchema,
  PaginatedResponseSchema,
  ApiErrorSchema,
} from "./api-schemas.js";

export type {
  ProfileInput,
  ProfilePatchInput,
  QuestionInput,
  AnswerInput,
  VoteInput,
} from "./api-schemas.js";
