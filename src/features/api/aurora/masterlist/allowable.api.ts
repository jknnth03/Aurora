import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import { ApiResponse } from "../types";

export interface IAllowableDaysResponse {
  id: number;
  allowable_days: number; // ← Response field name
  created_at: string | null;
  updated_at: string | null;
  deleted_at?: string | null;
}

// ✅ FIXED: Backend expects 'days' not 'allowable_days'
export interface AllowableDaysPayloadSchema {
  days: number; // ← Changed from allowable_days to days
}

export const allowableApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.ALLOWABLE_DAYS] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET (latest data) - allowable_days
      getAllowableDays: builder.query<
        ApiResponse<IAllowableDaysResponse>,
        void
      >({
        query: () => ({
          url: CONFIG.ENDPOINTS.ALLOWABLE_DAYS,
        }),
        providesTags: [
          { type: CONFIG.ENDPOINTS.ALLOWABLE_DAYS as const, id: "LATEST" },
        ],
      }),

      // POST (create) - allowable_days
      createAllowableDays: builder.mutation<
        ApiResponse<IAllowableDaysResponse>,
        AllowableDaysPayloadSchema
      >({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.ALLOWABLE_DAYS,
          method: "POST",
          body,
        }),
        invalidatesTags: [
          { type: CONFIG.ENDPOINTS.ALLOWABLE_DAYS as const, id: "LATEST" },
        ],
      }),

      // PUT (update) - allowable_days/1 - Using PATCH instead
      updateAllowableDays: builder.mutation<
        ApiResponse<IAllowableDaysResponse>,
        { id: string | number; body: AllowableDaysPayloadSchema }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.ALLOWABLE_DAYS}/${id}`,
          method: "PATCH", // ✅ Changed from PUT to PATCH
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.ALLOWABLE_DAYS as const, id },
          { type: CONFIG.ENDPOINTS.ALLOWABLE_DAYS as const, id: "LATEST" },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useGetAllowableDaysQuery,
  useLazyGetAllowableDaysQuery,
  useCreateAllowableDaysMutation,
  useUpdateAllowableDaysMutation,
} = allowableApi;
