import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import { ApiResponse, UnpaginatedApiResponse } from "../types";
import { ISearchParamsUnpaginated } from "./types";

export interface GradingSearchParamsUnpaginated
  extends ISearchParamsUnpaginated {
  sorts?: string;
}

export interface IGradingResponse {
  id: number;
  name?: string;
  min_score?: number;
  max_score?: number;
  cap_percentage: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at?: string | null;
}

// ✅ FIXED: Only cap_percentage is required for update
export interface GradingPayloadSchema {
  cap_percentage: number;
}

export const gradingApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.GRADING] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // ✅ Returns ARRAY - UnpaginatedApiResponse
      getGradings: builder.query<
        UnpaginatedApiResponse<IGradingResponse>,
        GradingSearchParamsUnpaginated
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.GRADING,
          params: {
            ...params,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.GRADING as const,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.GRADING as const, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.GRADING as const, id: "LIST" }],
      }),

      // ⚠️ DEPRECATED: Use getGradings instead
      // This returns array but typed as single object (mismatch)
      getGrading: builder.query<ApiResponse<IGradingResponse>, void>({
        query: () => ({
          url: CONFIG.ENDPOINTS.GRADING,
        }),
        providesTags: [{ type: CONFIG.ENDPOINTS.GRADING as const, id: "LIST" }],
      }),

      createGrading: builder.mutation<
        ApiResponse<IGradingResponse>,
        GradingPayloadSchema
      >({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.GRADING,
          method: "POST",
          body,
        }),
        invalidatesTags: [
          { type: CONFIG.ENDPOINTS.GRADING as const, id: "LIST" },
        ],
      }),

      // ✅ FIXED: Accepts only cap_percentage in body
      updateGrading: builder.mutation<
        ApiResponse<IGradingResponse>,
        { id: string | number; body: GradingPayloadSchema }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.GRADING}/${id}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.GRADING as const, id },
          { type: CONFIG.ENDPOINTS.GRADING as const, id: "LIST" },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useLazyGetGradingQuery,
  useGetGradingQuery,
  useLazyGetGradingsQuery,
  useGetGradingsQuery,
  useCreateGradingMutation,
  useUpdateGradingMutation,
} = gradingApi;
