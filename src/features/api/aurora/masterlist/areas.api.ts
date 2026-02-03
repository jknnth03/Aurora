import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import {
  ApiResponse,
  PaginatedApiResponse,
  UnpaginatedApiResponse,
} from "../types";
import { ISearchParams, ISearchParamsUnpaginated } from "./types";

export interface IAreaResponse {
  id: number;
  name: string;
  region: {
    id: number;
    name: string;
  };
  area_head: {
    id: number;
    full_name: string;
    user_status: string;
  };
}

interface IArchiveAreaResponse {
  id: number;
  name: string;
  region_head_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface AreaPayloadSchema {
  name: string;
  region_id: number;
  area_head_id: number;
}

export interface AreaSchema {
  name: string;
  region: {
    id: number;
    name: string;
  };
  area_head: {
    id: number;
    full_name: string;
    user_status: string;
  };
}

export const areasApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.AREA] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET - Read users with pagination
      getAreas: builder.query<
        PaginatedApiResponse<IAreaResponse>,
        ISearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.AREA,
          params: {
            ...params,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.AREA,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.AREA, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.AREA, id: "LIST" }],
      }),

      getUnpaginatedAreas: builder.query<
        UnpaginatedApiResponse<IAreaResponse>,
        ISearchParamsUnpaginated
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.AREA,
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
                  type: CONFIG.ENDPOINTS.AREA,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.AREA, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.AREA, id: "LIST" }],
      }),

      getArea: builder.query<ApiResponse<IAreaResponse>, string | number>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.AREA}/${id}`,
        }),
        providesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.AREA, id },
        ],
      }),

      createArea: builder.mutation<
        ApiResponse<IAreaResponse>,
        AreaPayloadSchema
      >({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.AREA,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.AREA, id: "LIST" }],
      }),

      updateArea: builder.mutation<
        ApiResponse<IAreaResponse>,
        { id: string | number; body: AreaPayloadSchema }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.AREA}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.AREA, id },
          { type: CONFIG.ENDPOINTS.AREA, id: "LIST" },
        ],
      }),

      archiveArea: builder.mutation<
        ApiResponse<IArchiveAreaResponse>,
        string | number
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.AREA}/${id}/toggle_archived`,
          method: "PATCH",
        }),
        invalidatesTags: () => [{ type: CONFIG.ENDPOINTS.AREA, id: "LIST" }],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useLazyGetAreaQuery,
  useGetAreaQuery,
  useLazyGetAreasQuery,
  useGetAreasQuery,
  useArchiveAreaMutation,
  useCreateAreaMutation,
  useUpdateAreaMutation,
  useGetUnpaginatedAreasQuery,
  useLazyGetUnpaginatedAreasQuery,
} = areasApi;
