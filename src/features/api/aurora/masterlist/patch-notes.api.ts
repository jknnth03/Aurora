import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import {
  ApiResponse,
  PaginatedApiResponse,
  UnpaginatedApiResponse,
} from "../types";
import { ISearchParams, ISearchParamsUnpaginated } from "./types";

export interface PatchNotesParams extends Omit<ISearchParams, "status"> {
  status?: "published" | "unpublished";
  sorts?: string;
}

export interface UserSearchParamsUnpaginated
  extends Omit<ISearchParamsUnpaginated, "status"> {
  status?: "published" | "unpublished";
  sorts?: string;
}

export interface IPatchNotesResponse {
  id: number;
  title: string;
  description: string;
  version: string;
  filename: string;
  filepath: string;
  file_url: string;
  type: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

// Type for API mutations that accept FormData
export type PatchNoteFormDataInput = FormData;

interface SerializableFile {
  data: string; // Base64
  fileName: string;
  type: string;
  size: number;
}

export const patchNotesApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.PATCH_NOTES] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET - Read users with pagination
      getPatchNotes: builder.query<
        PaginatedApiResponse<IPatchNotesResponse>,
        PatchNotesParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.PATCH_NOTES,
          params: {
            status: "active",
            ...params,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.PATCH_NOTES,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.PATCH_NOTES, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.PATCH_NOTES, id: "LIST" }],
      }),

      // GET - Read all users without pagination
      getPatchNotesUnpaginated: builder.query<
        UnpaginatedApiResponse<IPatchNotesResponse>,
        UserSearchParamsUnpaginated
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.PATCH_NOTES,
          params: {
            ...params,
            pagination: "none",
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.PATCH_NOTES,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.PATCH_NOTES, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.PATCH_NOTES, id: "LIST" }],
      }),

      getPatchNotesPublic: builder.query<
        PaginatedApiResponse<IPatchNotesResponse>,
        PatchNotesParams
      >({
        query: (params = {}) => ({
          url: `${CONFIG.ENDPOINTS.PATCH_NOTES}/public_display`,
          params: {
            status: "active",
            ...params,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: `${CONFIG.ENDPOINTS.PATCH_NOTES}/public_display`,
                  id,
                })),
                {
                  type: `${CONFIG.ENDPOINTS.PATCH_NOTES}/public_display`,
                  id: "LIST",
                },
              ]
            : [
                {
                  type: `${CONFIG.ENDPOINTS.PATCH_NOTES}/public_display`,
                  id: "LIST",
                },
              ],
      }),

      // GET - Read all users without pagination
      getPatchNotesPublicUnpaginated: builder.query<
        UnpaginatedApiResponse<IPatchNotesResponse>,
        UserSearchParamsUnpaginated
      >({
        query: (params = {}) => ({
          url: `${CONFIG.ENDPOINTS.PATCH_NOTES}/public_display`,
          params: {
            ...params,
            pagination: "none",
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.map(({ id }) => ({
                  type: `${CONFIG.ENDPOINTS.PATCH_NOTES}/public_display`,
                  id,
                })),
                {
                  type: `${CONFIG.ENDPOINTS.PATCH_NOTES}/public_display`,
                  id: "LIST",
                },
              ]
            : [
                {
                  type: `${CONFIG.ENDPOINTS.PATCH_NOTES}/public_display`,
                  id: "LIST",
                },
              ],
      }),

      getPatchNote: builder.query<
        ApiResponse<IPatchNotesResponse>,
        string | number
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.PATCH_NOTES}/${id}`,
        }),
        providesTags: (_result, _error, id) => [
          { type: CONFIG.ENDPOINTS.PATCH_NOTES, id },
        ],
      }),

      getPatchNoteFile: builder.query<string, string>({
        query: (fileName) => ({
          url: `${CONFIG.ENDPOINTS.PATCH_NOTES}/download/${fileName}`,
          responseHandler: (response) => response.text(),
        }),
        providesTags: (_result, _error, id) => [
          { type: CONFIG.ENDPOINTS.PATCH_NOTES, id },
        ],
      }),

      // Fixed: Changed from PatchNoteFormData to PatchNoteFormDataInput (FormData)
      createPatchNote: builder.mutation<
        ApiResponse<IPatchNotesResponse>,
        PatchNoteFormDataInput
      >({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.PATCH_NOTES,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.PATCH_NOTES, id: "LIST" }],
      }),

      // Fixed: Changed from PatchNoteFormData to PatchNoteFormDataInput (FormData)
      updatePatchNote: builder.mutation<
        ApiResponse<IPatchNotesResponse>,
        PatchNoteFormDataInput
      >({
        query: (body) => {
          const id = body.get("id");
          return {
            url: `${CONFIG.ENDPOINTS.PATCH_NOTES}/${id}`,
            method: "POST",
            body: body,
          };
        },
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.PATCH_NOTES, id: "LIST" }],
      }),

      publishPatchNote: builder.mutation<
        ApiResponse<IPatchNotesResponse>,
        string
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.PATCH_NOTES}/${id}/publish_update`,
          method: "PATCH",
        }),
        invalidatesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.PATCH_NOTES, id },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useCreatePatchNoteMutation,
  useGetPatchNoteQuery,
  useGetPatchNotesQuery,
  useGetPatchNotesUnpaginatedQuery,
  useLazyGetPatchNoteQuery,
  useLazyGetPatchNotesQuery,
  useLazyGetPatchNotesUnpaginatedQuery,
  useUpdatePatchNoteMutation,
  useGetPatchNoteFileQuery,
  useLazyGetPatchNoteFileQuery,
  useGetPatchNotesPublicQuery,
  useGetPatchNotesPublicUnpaginatedQuery,
  usePublishPatchNoteMutation,
} = patchNotesApi;
