import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import { ApiResponse, PaginatedApiResponse } from "../types";
import { Department } from "./department.api";
import { ISearchParams } from "./types";

export interface Unit {
  id: number;
  sync_id: number;
  department_unit_code: string;
  department_unit_name: string;
  department_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  department?: Department;
}

export interface UnitSearchParams extends ISearchParams {
  sorts?: string;
  department_id?: number;
}

export const unitsApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.UNITS] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getUnits: builder.query<PaginatedApiResponse<Unit>, UnitSearchParams>({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.UNITS,
          params,
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.UNITS,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.UNITS, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.UNITS, id: "LIST" }],
      }),

      getUnit: builder.query<ApiResponse<Unit>, string>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.UNITS}/${id}`,
        }),
        providesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.UNITS, id },
        ],
      }),

      createUnit: builder.mutation<ApiResponse<Unit>, Partial<Unit>>({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.UNITS,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.UNITS, id: "LIST" }],
      }),

      updateUnit: builder.mutation<
        ApiResponse<Unit>,
        { id: string; body: Partial<Unit> }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.UNITS}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.UNITS, id },
        ],
      }),

      archiveUnit: builder.mutation<ApiResponse<null>, string>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.UNITS}/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.UNITS, id },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useGetUnitsQuery,
  useGetUnitQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useLazyGetUnitQuery,
  useLazyGetUnitsQuery,
  useArchiveUnitMutation,
} = unitsApi;
