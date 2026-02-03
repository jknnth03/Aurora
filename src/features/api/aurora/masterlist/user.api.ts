import { CONFIG } from "../../../../config/config";
import {
  UserPayloadSchema,
  UserUpdatePayloadSchema,
} from "../../../../pages/(masterlist)/users/user.schema";
import { api } from "../index.api";
import {
  ApiResponse,
  PaginatedApiResponse,
  UnpaginatedApiResponse,
} from "../types/types";
import { IOneCharging } from "./one-charging.api";
import { Role } from "./role.api";

export interface UserSearchParams {
  search?: string;
  page?: number;
  per_page?: number;
  status?: "active" | "inactive";
  sorts?: string;
}

export interface UserSearchParamsUnpaginated {
  search?: string;
  status?: "active" | "inactive";
  sorts?: string;
}

export interface IUserResponse {
  uniqueId: string | number;
  id: number;
  id_prefix: string;
  id_no: string;
  full_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  mobile_number: string;
  gender: string;
  one_charging: IOneCharging | null;
  username: string;
  role: Role;
  created_at: string;
  deleted_at: string | null;
}

interface IArchiveUserResponse
  extends Omit<IUserResponse, "one_charging" | "role"> {
  one_charging_id: number;
  one_charging_sync_id?: number;
  one_charging_code: string | null;
  one_charging_name: string | null;
}

export const userApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.USERS] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET - Read users with pagination
      getUsers: builder.query<
        PaginatedApiResponse<IUserResponse>,
        UserSearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.USERS,
          params: {
            status: "active",
            ...params,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.USERS,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.USERS, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.USERS, id: "LIST" }],
      }),

      // GET - Read all users without pagination
      getUsersUnpaginated: builder.query<
        UnpaginatedApiResponse<IUserResponse>,
        UserSearchParamsUnpaginated
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.USERS,
          params: {
            ...params,
            pagination: "none",
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.USERS,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.USERS, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.USERS, id: "LIST" }],
      }),

      getUser: builder.query<ApiResponse<IUserResponse>, string | number>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.USERS}/${id}`,
        }),
        providesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.USERS, id },
        ],
      }),

      createUser: builder.mutation<
        ApiResponse<IUserResponse>,
        UserPayloadSchema
      >({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.USERS,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.USERS, id: "LIST" }],
      }),

      updateUser: builder.mutation<
        ApiResponse<IUserResponse>,
        { id: string | number; body: UserUpdatePayloadSchema }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.USERS}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.USERS, id },
          { type: CONFIG.ENDPOINTS.USERS, id: "LIST" },
        ],
      }),

      //   archiveUser: builder.mutation<ApiResponse<null>, string | number>({
      //     query: (id) => ({
      //   url: `${CONFIG.ENDPOINTS.USERS}-archived/${id}`,
      //       method: "PUT",
      //     }),
      //     invalidatesTags: (result, error, id) => [
      //       { type: CONFIG.ENDPOINTS.USERS, id },
      //       { type: CONFIG.ENDPOINTS.USERS, id: "LIST" },
      //     ],
      //   }),

      archiveUser: builder.mutation<
        ApiResponse<IArchiveUserResponse>,
        string | number
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.USERS}/${id}/toggle_archived`,
          method: "PATCH",
        }),
        invalidatesTags: () => [{ type: CONFIG.ENDPOINTS.USERS, id: "LIST" }],
      }),
      restoreUser: builder.mutation<
        ApiResponse<IUserResponse>,
        string | number
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.USERS}-restore/${id}`,
          method: "PUT",
        }),
        invalidatesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.USERS, id },
          { type: CONFIG.ENDPOINTS.USERS, id: "LIST" },
        ],
      }),

      deleteUser: builder.mutation<ApiResponse<null>, string | number>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.USERS}/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.USERS, id },
          { type: CONFIG.ENDPOINTS.USERS, id: "LIST" },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useLazyGetUsersQuery,
  useGetUsersQuery,
  useLazyGetUsersUnpaginatedQuery,
  useGetUsersUnpaginatedQuery,
  useLazyGetUserQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useArchiveUserMutation,
  useRestoreUserMutation,
  useDeleteUserMutation,
} = userApi;
