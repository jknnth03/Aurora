import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import { ApiResponse, PaginatedApiResponse } from "../types";
import { BusinessUnit } from "./business-unit.api";
import { ISearchParams } from "./types";

export interface Department {
  id: number;
  sync_id: number;
  department_code: string;
  department_name: string;
  business_unit_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  business_unit?: BusinessUnit;
}

export interface DepartmentSearchParams extends ISearchParams {
  sorts?: string;
  business_unit_id?: number;
}

export const departmentsApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.DEPARTMENTS] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getDepartments: builder.query<
        PaginatedApiResponse<Department>,
        DepartmentSearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.DEPARTMENTS,
          params,
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.DEPARTMENTS,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.DEPARTMENTS, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.DEPARTMENTS, id: "LIST" }],
      }),

      getDepartment: builder.query<ApiResponse<Department>, string>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.DEPARTMENTS}/${id}`,
        }),
        providesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.DEPARTMENTS, id },
        ],
      }),

      createDepartment: builder.mutation<
        ApiResponse<Department>,
        Partial<Department>
      >({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.DEPARTMENTS,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.DEPARTMENTS, id: "LIST" }],
      }),

      updateDepartment: builder.mutation<
        ApiResponse<Department>,
        { id: string; body: Partial<Department> }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.DEPARTMENTS}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.DEPARTMENTS, id },
        ],
      }),

      archiveDepartment: builder.mutation<ApiResponse<null>, string>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.DEPARTMENTS}/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.DEPARTMENTS, id },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useGetDepartmentsQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useArchiveDepartmentMutation,
  useLazyGetDepartmentQuery,
  useLazyGetDepartmentsQuery,
} = departmentsApi;
