import { CONFIG } from "../../../../config/config";
import { ChecklistPayloadSchema } from "../../../../pages/(masterlist)/checklists/checklist.schema";
import { api } from "../index.api";
import { ApiResponse, PaginatedApiResponse } from "../types";
import { ISearchParams } from "./types";

export interface IChecklistResponse {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sections: Array<{
    id: number;
    checklist_id: number;
    title: string;
    category?: {
      id: number;
      name: string;
      deleted_at: string | null;
      created_at: string;
      updated_at: string;
    };
    order_index: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    questions: Array<{
      id: number;
      section_id: number;
      question_text: string;
      question_type: "multiple_choice" | "checkboxes" | "paragraph";
      order_index: number;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      options: Array<{
        id: number;
        question_id: number;
        option_text: string;
        order_index: number;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>;
    }>;
  }>;
}

interface IArchiveChecklistResponse {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export const checklistApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.CHECKLIST] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET - Read users with pagination
      getChecklists: builder.query<
        PaginatedApiResponse<IChecklistResponse>,
        ISearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.CHECKLIST,
          params: {
            ...params,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.CHECKLIST,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.CHECKLIST, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.CHECKLIST, id: "LIST" }],
      }),

      getChecklist: builder.query<
        ApiResponse<IChecklistResponse>,
        string | number
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.CHECKLIST}/${id}`,
        }),
        providesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.CHECKLIST, id },
        ],
      }),

      createChecklist: builder.mutation<
        ApiResponse<IChecklistResponse>,
        ChecklistPayloadSchema
      >({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.CHECKLIST,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.CHECKLIST, id: "LIST" }],
      }),

      updateChecklist: builder.mutation<
        ApiResponse<IChecklistResponse>,
        { id: string | number; body: ChecklistPayloadSchema }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.CHECKLIST}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.CHECKLIST, id },
          { type: CONFIG.ENDPOINTS.CHECKLIST, id: "LIST" },
        ],
      }),

      archiveChecklist: builder.mutation<
        ApiResponse<IArchiveChecklistResponse>,
        string | number
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.CHECKLIST}/${id}/toggle_archived`,
          method: "PATCH",
        }),
        invalidatesTags: () => [
          { type: CONFIG.ENDPOINTS.CHECKLIST, id: "LIST" },
        ],
      }),
      restoreChecklist: builder.mutation<
        ApiResponse<IChecklistResponse>,
        string | number
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.CHECKLIST}-restore/${id}`,
          method: "PUT",
        }),
        invalidatesTags: (results, errors, id) => [
          { type: CONFIG.ENDPOINTS.CHECKLIST, id },
          { type: CONFIG.ENDPOINTS.CHECKLIST, id: "LIST" },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useLazyGetChecklistsQuery,
  useGetChecklistsQuery,
  useGetChecklistQuery,
  useLazyGetChecklistQuery,
  useArchiveChecklistMutation,
  useRestoreChecklistMutation,
  useCreateChecklistMutation,
  useUpdateChecklistMutation,
} = checklistApi;
