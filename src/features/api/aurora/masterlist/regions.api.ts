import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import {
  ApiResponse,
  PaginatedApiResponse,
  UnpaginatedApiResponse,
} from "../types";
import { ISearchParams, ISearchParamsUnpaginated } from "./types";

export interface RegionSearchParams extends ISearchParams {
  sorts?: string;
}

export interface RegionSearchParamsUnpaginated
  extends ISearchParamsUnpaginated {
  sorts?: string;
}

export interface IRegionResponse {
  id: number;
  name: string;
  region_head_id: number;
  region_head: {
    id: number;
    full_name: string;
    user_status: string;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  areas: string | null;
}

interface IArchiveRegionResponse {
  id: number;
  name: string;
  region_head_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface RegionPayloadSchema {
  name: string;
  region_head_id?: number;
}

export interface RegionSchema {
  name: string;
  region_head: {
    id?: number;
    full_name?: string;
  };
}

export const regionApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.REGION] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET - Read users with pagination
      getRegions: builder.query<
        PaginatedApiResponse<IRegionResponse>,
        RegionSearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.REGION,
          params: {
            ...params,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.REGION,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.REGION, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.REGION, id: "LIST" }],
      }),

      getUnpaginatedRegions: builder.query<
        UnpaginatedApiResponse<IRegionResponse>,
        RegionSearchParamsUnpaginated
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.REGION,
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
                  type: CONFIG.ENDPOINTS.REGION,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.REGION, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.REGION, id: "LIST" }],
      }),

      getRegion: builder.query<ApiResponse<IRegionResponse>, string | number>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.REGION}/${id}`,
        }),
        providesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.REGION, id },
        ],
      }),

      createRegion: builder.mutation<
        ApiResponse<IRegionResponse>,
        RegionPayloadSchema
      >({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.REGION,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.REGION, id: "LIST" }],
      }),

      updateRegion: builder.mutation<
        ApiResponse<IRegionResponse>,
        { id: string | number; body: RegionPayloadSchema }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.REGION}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.REGION, id },
          { type: CONFIG.ENDPOINTS.REGION, id: "LIST" },
        ],
      }),

      archiveRegion: builder.mutation<
        ApiResponse<IArchiveRegionResponse>,
        string | number
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.REGION}/${id}/toggle_archived`,
          method: "PATCH",
        }),
        invalidatesTags: () => [{ type: CONFIG.ENDPOINTS.REGION, id: "LIST" }],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useLazyGetRegionQuery,
  useGetRegionQuery,
  useLazyGetRegionsQuery,
  useGetRegionsQuery,
  useArchiveRegionMutation,
  useCreateRegionMutation,
  useUpdateRegionMutation,
  useGetUnpaginatedRegionsQuery,
  useLazyGetUnpaginatedRegionsQuery,
} = regionApi;
