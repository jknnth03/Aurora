import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import { ApiResponse, PaginatedApiResponse } from "../types";
import { ISearchParams, ISearchParamsUnpaginated } from "./types";

export interface StoreChecklistSearchParams extends ISearchParams {
  sorts?: string;
}

export interface StoreChecklistSearchParamsUnpaginated
  extends ISearchParamsUnpaginated {
  sorts?: string;
}

export interface IStoreChecklistResponse {
  id: number;
  code: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  store: {
    id: number;
    code: number;
    name: string;
    region_id: number;
    area_id: number;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
  };
  checklist: {
    id: number;
    name: string;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
  };
}

interface IArchiveStoreChecklistResponse {
  id: number;
  code: string;
  store_id: number;
  checklist_id: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface StoreChecklistPayloadSchema {
  store_id: number;
  store_name: string;
  checklist_id: number;
  checklist_name: string;
}

export const storeChecklistApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.STORE_CHECKLIST] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET - Read users with pagination
      getStoreChecklists: builder.query<
        PaginatedApiResponse<IStoreChecklistResponse>,
        StoreChecklistSearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.STORE_CHECKLIST,
          params: {
            ...params,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.STORE_CHECKLIST,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.STORE_CHECKLIST, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.STORE_CHECKLIST, id: "LIST" }],
      }),

      getStoreChecklist: builder.query<
        ApiResponse<IStoreChecklistResponse>,
        string | number
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.STORE_CHECKLIST}/${id}`,
        }),
        providesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.STORE_CHECKLIST, id },
        ],
      }),

      createStoreChecklist: builder.mutation<
        ApiResponse<IStoreChecklistResponse>,
        StoreChecklistPayloadSchema
      >({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.STORE_CHECKLIST,
          method: "POST",
          body,
        }),
        invalidatesTags: [
          { type: CONFIG.ENDPOINTS.STORE_CHECKLIST, id: "LIST" },
        ],
      }),

      updateStoreChecklist: builder.mutation<
        ApiResponse<IStoreChecklistResponse>,
        { id: string | number; body: StoreChecklistPayloadSchema }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.STORE_CHECKLIST}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.STORE_CHECKLIST, id },
          { type: CONFIG.ENDPOINTS.STORE_CHECKLIST, id: "LIST" },
        ],
      }),

      archiveStoreChecklist: builder.mutation<
        ApiResponse<IArchiveStoreChecklistResponse>,
        string | number
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.STORE_CHECKLIST}/${id}/toggle_archived`,
          method: "PATCH",
        }),
        invalidatesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.STORE_CHECKLIST, id: "LIST" },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useLazyGetStoreChecklistQuery,
  useGetStoreChecklistQuery,
  useLazyGetStoreChecklistsQuery,
  useGetStoreChecklistsQuery,
  useArchiveStoreChecklistMutation,
  useCreateStoreChecklistMutation,
  useUpdateStoreChecklistMutation,
} = storeChecklistApi;
