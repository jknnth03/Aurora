import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import { ApiResponse, PaginatedApiResponse } from "../types";
import { ISearchParams } from "./types";
import { Unit } from "./unit.api";

export interface SubUnit {
  id: number;
  sync_id: number;
  sub_unit_code: string;
  sub_unit_name: string;
  unit_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  unit?: Unit;
  pivot?: {
    location_id: number;
    sub_unit_id: number;
  };
}

export interface SubUnitSearchParams extends ISearchParams {
  sorts?: string;
  unit_id?: number;
  location_id?: number;
}

export const subUnitsApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.SUBUNITS] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getSubUnits: builder.query<
        PaginatedApiResponse<SubUnit>,
        SubUnitSearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.SUBUNITS,
          params,
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.SUBUNITS,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.SUBUNITS, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.SUBUNITS, id: "LIST" }],
      }),

      getSubUnit: builder.query<ApiResponse<SubUnit>, string>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.SUBUNITS}/${id}`,
        }),
        providesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.SUBUNITS, id },
        ],
      }),

      createSubUnit: builder.mutation<ApiResponse<SubUnit>, Partial<SubUnit>>({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.SUBUNITS,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.SUBUNITS, id: "LIST" }],
      }),

      updateSubUnit: builder.mutation<
        ApiResponse<SubUnit>,
        { id: string; body: Partial<SubUnit> }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.SUBUNITS}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.SUBUNITS, id },
        ],
      }),

      archiveSubUnit: builder.mutation<ApiResponse<null>, string>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.SUBUNITS}/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.SUBUNITS, id },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useGetSubUnitsQuery,
  useGetSubUnitQuery,
  useCreateSubUnitMutation,
  useUpdateSubUnitMutation,
  useArchiveSubUnitMutation,
  useLazyGetSubUnitQuery,
  useLazyGetSubUnitsQuery,
} = subUnitsApi;
