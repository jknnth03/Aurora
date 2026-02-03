import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import { ApiResponse, PaginatedApiResponse } from "../types";
import { IAreaResponse } from "./areas.api";
import { IRegionResponse } from "./regions.api";
import { ISearchParams, ISearchParamsUnpaginated } from "./types";

export interface StoreSearchParams extends ISearchParams {
  sorts?: string;
}

export interface StoreSearchParamsUnpaginated extends ISearchParamsUnpaginated {
  sorts?: string;
}

export interface IStoreResponse {
  id: number;
  code: string | null;
  name: string | null;
  region: IRegionResponse;
  area: IAreaResponse;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface IArchiveStoreResponse {
  id: number;
  code: string;
  name: string;
  region_id: string;
  area_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface StorePayloadSchema {
  name: string;
  region_id: number;
  area_id: number;
}

export const storeApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.STORE] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET - Read users with pagination
      getStores: builder.query<
        PaginatedApiResponse<IStoreResponse>,
        StoreSearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.STORE,
          params: {
            ...params,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.STORE,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.STORE, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.STORE, id: "LIST" }],
      }),

      getStore: builder.query<ApiResponse<IStoreResponse>, string | number>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.STORE}/${id}`,
        }),
        providesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.STORE, id },
        ],
      }),

      createStore: builder.mutation<
        ApiResponse<IStoreResponse>,
        StorePayloadSchema
      >({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.STORE,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.STORE, id: "LIST" }],
      }),

      updateStore: builder.mutation<
        ApiResponse<IStoreResponse>,
        { id: string | number; body: StorePayloadSchema }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.STORE}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.STORE, id },
          { type: CONFIG.ENDPOINTS.STORE, id: "LIST" },
        ],
      }),

      archiveStore: builder.mutation<
        ApiResponse<IArchiveStoreResponse>,
        string | number
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.STORE}/${id}/toggle_archived`,
          method: "PATCH",
        }),
        invalidatesTags: () => [{ type: CONFIG.ENDPOINTS.STORE, id: "LIST" }],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useLazyGetStoreQuery,
  useGetStoreQuery,
  useLazyGetStoresQuery,
  useGetStoresQuery,
  useArchiveStoreMutation,
  useCreateStoreMutation,
  useUpdateStoreMutation,
} = storeApi;
