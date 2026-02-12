import { CONFIG } from "../../../config/config";
import { api } from "./index.api";
import {
  ForApprovalResponse,
  IQADashboardResponse,
  IQAWeekResponse,
  QAStoreChecklist,
  ResurveyResponse,
} from "./types/qa-dashboard-types";
import {
  ApiResponse,
  PaginatedApiResponse,
  UnpaginatedApiResponse,
} from "./types/types";

export interface QADashboardSearchParams {
  search?: string;
  page?: number;
  per_page?: number;
  status?: "active" | "inactive";
  sorts?: string;
  month?: number;
  year?: number;
  region?: string;
  area?: string;
}

export interface QADashboardSearchParamsUnpaginated {
  search?: string;
  status?: "active" | "inactive";
  sorts?: string;
}

export interface QADashboardPayloadSchema {
  store_id: number;
  checklist_id: number;
  store_checklist_id: number;
  code: string;
  section: Array<{ section_id: number; section_order_index: number }>;
  response: Array<{
    section_id: number;
    question_id: number;
    question_order_index: number;
    question_text: string;
    question_type: "multiple_choice" | "checkboxes" | "paragraph";
    answer: number | number[] | string[] | string | (number | string)[] | null;
    answer_text: string | string[];
    remarks: string;
  }>;
  store_visit: "1" | null | "0";
  expired: "1" | null | "0";
  condemned: "1" | null | "0";
  store_duty_id: number[];
  good_points: string;
  notes: string;
  status: string;
}

export interface QADashboardSchema {
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

export interface AllowableDaysResponse {
  id: number;
  allowable_days: number;
  created_at: string;
  updated_at: string;
}

export const qaDashboardApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.QA] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getQAs: builder.query<
        PaginatedApiResponse<IQADashboardResponse>,
        QADashboardSearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.QA,
          params: {
            ...params,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.QA,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.QA, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.QA, id: "LIST" }],
      }),

      getUnpaginatedQAs: builder.query<
        UnpaginatedApiResponse<IQADashboardResponse>,
        QADashboardSearchParamsUnpaginated
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.QA,
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
                  type: CONFIG.ENDPOINTS.QA,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.QA, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.QA, id: "LIST" }],
      }),

      getQA: builder.query<
        ApiResponse<IQAWeekResponse>,
        {
          id: string;
          month: string;
          year: string;
          week?: string;
          store_checklist_id?: string;
        }
      >({
        query: ({ id, month, year, week, store_checklist_id }) => ({
          url: `${CONFIG.ENDPOINTS.QA}/${id}`,
          params: {
            month,
            year,
            week,
            store_checklist_id,
          },
        }),
        providesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.QA, id: id.id },
          { type: CONFIG.ENDPOINTS.QA, id: "LIST" },
        ],
      }),

      createQA: builder.mutation<ApiResponse<IQADashboardResponse>, FormData>({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.QA,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.QA, id: "LIST" }],
      }),

      updateQA: builder.mutation<
        ApiResponse<IQADashboardResponse>,
        { id: string | number; body: QADashboardPayloadSchema }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.QA}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.QA, id },
          { type: CONFIG.ENDPOINTS.QA, id: "LIST" },
        ],
      }),

      archiveQA: builder.mutation<
        ApiResponse<IQADashboardResponse>,
        string | number
      >({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.QA}/${id}/toggle_archived`,
          method: "PATCH",
        }),
        invalidatesTags: () => [{ type: CONFIG.ENDPOINTS.QA, id: "LIST" }],
      }),

      getQAStoreChecklist: builder.query<
        ApiResponse<QAStoreChecklist[]>,
        { id: number; month: number; year: number }
      >({
        query: (params) => ({
          url: `${CONFIG.ENDPOINTS.QA}/${params.id}`,
          params: {
            month: params.month,
            year: params.year,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.QA,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.QA, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.QA, id: "LIST" }],
      }),

      resurvey: builder.mutation<
        ApiResponse<ResurveyResponse>,
        { body: FormData; id: number | string }
      >({
        query: ({ id, body }) => {
          return {
            url: `${CONFIG.ENDPOINTS.QA}/${id}`,
            body: body,
            method: "POST",
          };
        },
        invalidatesTags: () => [
          { type: CONFIG.ENDPOINTS.QA, id: "LIST" },
          { type: CONFIG.ENDPOINTS.SURVEY_APPROVER, id: "LIST" },
        ],
      }),

      forApproval: builder.mutation<
        ApiResponse<ForApprovalResponse>,
        { body: { reason: string }; id: number | string }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.QA}/${id}/for_approval`,
          body: { ...body },
          method: "PATCH",
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.SURVEY_APPROVER, id: "LIST" },
          { type: CONFIG.ENDPOINTS.QA, id: id },
          { type: CONFIG.ENDPOINTS.QA, id: "LIST" },
        ],
      }),

      downloadImages: builder.mutation<
        ApiResponse<{
          message: string;
          download_urls: string[];
          not_found: string[];
          zip_used: boolean;
          base_path: string;
        }>,
        { filenames: Array<string>; zip: boolean }
      >({
        query: ({ filenames, zip }) => ({
          url: `${CONFIG.ENDPOINTS.QA}/download/attachments`,
          method: "POST",
          body: {
            filenames,
            zip,
          },
          responseHandler: async (response) => {
            if (!response.ok) {
              throw new Error("Failed to download images");
            }
            return response.blob();
          },
        }),
        invalidatesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.QA, id: "LIST" },
        ],
      }),

      getImage: builder.query<string, { filename: string }>({
        query: (params) => ({
          url: `attachments/view`,
          params: {
            filename: params.filename,
          },
          responseHandler: (response) => response.blob(),
        }),
        async transformResponse(imageBlob: Blob) {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
          });
        },
      }),

      getAllowableDays: builder.query<ApiResponse<AllowableDaysResponse>, void>(
        {
          query: () => ({
            url: `allowable_days`,
          }),
          providesTags: [{ type: CONFIG.ENDPOINTS.QA, id: "ALLOWABLE_DAYS" }],
        },
      ),
    }),
    overrideExisting: false,
  });

export const {
  useLazyGetQAQuery,
  useLazyGetQAsQuery,
  useGetQAQuery,
  useGetQAsQuery,
  useArchiveQAMutation,
  useCreateQAMutation,
  useUpdateQAMutation,
  useGetUnpaginatedQAsQuery,
  useLazyGetUnpaginatedQAsQuery,
  useLazyGetQAStoreChecklistQuery,
  useGetQAStoreChecklistQuery,
  useResurveyMutation,
  useForApprovalMutation,
  useDownloadImagesMutation,
  useGetImageQuery,
  useLazyGetImageQuery,
  useGetAllowableDaysQuery,
  useLazyGetAllowableDaysQuery,
} = qaDashboardApi;
