import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import { ApiResponse, PaginatedApiResponse } from "../types";
import { ISearchParams } from "./types";

export interface Company {
  id: number;
  sync_id: number;
  company_code: string;
  company_name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const companiesApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.COMPANIES] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getCompanies: builder.query<PaginatedApiResponse<Company>, ISearchParams>(
        {
          query: (params = {}) => ({
            url: CONFIG.ENDPOINTS.COMPANIES,
            params,
          }),
          providesTags: (result) =>
            result
              ? [
                  ...result.data.data.map(({ id }) => ({
                    type: CONFIG.ENDPOINTS.COMPANIES,
                    id,
                  })),
                  { type: CONFIG.ENDPOINTS.COMPANIES, id: "LIST" },
                ]
              : [{ type: CONFIG.ENDPOINTS.COMPANIES, id: "LIST" }],
        }
      ),

      getCompany: builder.query<ApiResponse<Company>, string>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.COMPANIES}/${id}`,
        }),
        providesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.COMPANIES, id },
        ],
      }),

      createCompany: builder.mutation<ApiResponse<Company>, Partial<Company>>({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.COMPANIES,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.COMPANIES, id: "LIST" }],
      }),

      updateCompany: builder.mutation<
        ApiResponse<Company>,
        { id: string; body: Partial<Company> }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.COMPANIES}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.COMPANIES, id },
        ],
      }),

      archiveCompany: builder.mutation<ApiResponse<null>, string>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.COMPANIES}/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.COMPANIES, id },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useGetCompaniesQuery,
  useGetCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useLazyGetCompaniesQuery,
  useLazyGetCompanyQuery,
  useArchiveCompanyMutation,
} = companiesApi;
