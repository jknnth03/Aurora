import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import {
  ApiResponse,
  PaginatedApiResponse,
  UnpaginatedApiResponse,
} from "../types";
import { ISearchParams, ISearchParamsUnpaginated } from "./types";

export interface ScoreRatingSearchParams extends ISearchParams {
  sorts?: string;
}

export interface ScoreRatingSearchParamsUnpaginated
  extends ISearchParamsUnpaginated {
  sorts?: string;
}

export interface IScoreRatingResponse {
  id: number;
  rating: number;
  score: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

type IArchiveScoreRatingResponse = IScoreRatingResponse;

export interface ScoreRatingPayloadSchema {
  rating: number;
  score: number;
}

export interface ScoreRatingSchema {
  rating: number;
  score: number;
}

export const scoreRatingApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.SCORE_RATING] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET - Read users with pagination
      getScoreRatings: builder.query<
        PaginatedApiResponse<IScoreRatingResponse>,
        ScoreRatingSearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.SCORE_RATING,
          params: {
            ...params,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.SCORE_RATING,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.SCORE_RATING, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.SCORE_RATING, id: "LIST" }],
      }),

      getUnpaginatedScoreRatings: builder.query<
        UnpaginatedApiResponse<IScoreRatingResponse>,
        ScoreRatingSearchParamsUnpaginated
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.SCORE_RATING,
          params: {
            ...params,
            pagination: "none",
            status: "active",
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.SCORE_RATING,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.SCORE_RATING, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.SCORE_RATING, id: "LIST" }],
      }),

      getScoreRating: builder.query<
        ApiResponse<IScoreRatingResponse>,
        string | number
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.SCORE_RATING}/${id}`,
        }),
        providesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.SCORE_RATING, id },
        ],
      }),

      createScoreRating: builder.mutation<
        ApiResponse<IScoreRatingResponse>,
        ScoreRatingPayloadSchema
      >({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.SCORE_RATING,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.SCORE_RATING, id: "LIST" }],
      }),

      updateScoreRating: builder.mutation<
        ApiResponse<IScoreRatingResponse>,
        { id: string | number; body: ScoreRatingPayloadSchema }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.SCORE_RATING}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.SCORE_RATING, id },
          { type: CONFIG.ENDPOINTS.SCORE_RATING, id: "LIST" },
        ],
      }),

      archiveScoreRating: builder.mutation<
        ApiResponse<IArchiveScoreRatingResponse>,
        string | number
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.SCORE_RATING}/${id}/toggle_archived`,
          method: "PATCH",
        }),
        invalidatesTags: () => [
          { type: CONFIG.ENDPOINTS.SCORE_RATING, id: "LIST" },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useLazyGetScoreRatingQuery,
  useGetScoreRatingQuery,
  useLazyGetScoreRatingsQuery,
  useGetScoreRatingsQuery,
  useArchiveScoreRatingMutation,
  useCreateScoreRatingMutation,
  useUpdateScoreRatingMutation,
  useGetUnpaginatedScoreRatingsQuery,
  useLazyGetUnpaginatedScoreRatingsQuery,
} = scoreRatingApi;
