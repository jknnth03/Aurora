// src/services/userApi.ts
import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import {
  ApiResponse,
  PaginatedApiResponse,
  UnpaginatedApiResponse,
} from "../types";
import { ISearchParams, ISearchParamsUnpaginated } from "./types";

// Define types for query parameters
export interface RoleSearchParams extends ISearchParams {
  sorts?: string;
}

export interface RoleSearchParamsUnpaginated extends ISearchParamsUnpaginated {
  sorts?: string;
}

export interface Role {
  id: number;
  name: string;
  access_permission: string[];
  updated_at?: string;
  created_at?: string;
  deleted_at: string | null;
}

// Define a service using a base URL and expected endpoints
export const roleApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.ROLES] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET - Read roles with pagination
      getRoles: builder.query<PaginatedApiResponse<Role>, RoleSearchParams>({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.ROLES,
          params: {
            status: "active",
            ...params,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.ROLES,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.ROLES, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.ROLES, id: "LIST" }],
      }),

      // GET - Read all roles without pagination
      getRolesUnpaginated: builder.query<
        UnpaginatedApiResponse<Role>,
        RoleSearchParamsUnpaginated
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.ROLES,
          params: {
            status: "active",
            ...params,
            pagination: "none",
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.ROLES,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.ROLES, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.ROLES, id: "LIST" }],
      }),
      getRole: builder.query<ApiResponse<Role>, string | number>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.ROLES}/${id}`,
        }),
        providesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.ROLES, id },
        ],
      }),
      // POST - Create a new role
      createRole: builder.mutation<ApiResponse<Role>, Partial<Role>>({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.ROLES,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.ROLES, id: "LIST" }],
      }),

      // PATCH - Update an existing role
      updateRole: builder.mutation<
        ApiResponse<Role>,
        { id: string; body: Partial<Role> }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.ROLES}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.ROLES, id },
        ],
      }),

      // PUT - Archive a role
      archiveRole: builder.mutation<ApiResponse<null>, string>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.ROLES}/${id}/toggle_archived`,
          method: "PATCH",
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.ROLES, id: "LIST" }],
      }),
    }),
    overrideExisting: false,
  });

// Export hooks for usage in functional components
export const {
  useLazyGetRolesQuery,
  useGetRolesQuery,
  useLazyGetRolesUnpaginatedQuery,
  useGetRolesUnpaginatedQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useGetRoleQuery,
  useLazyGetRoleQuery,
  useArchiveRoleMutation,
} = roleApi;
