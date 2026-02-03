import { CONFIG } from "../../../config/config";
import { api } from "./index.api";
import { ApiResponse, PaginatedApiResponse } from "./types/types";
import { SurveyApproversResponse } from "./types/survey-approver-types";

export interface SurveyApproversSearchParams {
  search?: string;
  page?: number;
  per_page?: number;
  status?: "pending" | "approved" | "rejected";
  month?: string;
  year?: string;
  id?: number;
  remarks?: string;
}

export const surveyApproverApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.SURVEY_APPROVER] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET - Read users with pagination
      getSurveyApprovers: builder.query<
        PaginatedApiResponse<SurveyApproversResponse>,
        SurveyApproversSearchParams
      >({
        query: (params = { status: "pending" }) => ({
          url: CONFIG.ENDPOINTS.SURVEY_APPROVER,
          params: {
            ...params,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.SURVEY_APPROVER,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.SURVEY_APPROVER, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.SURVEY_APPROVER, id: "LIST" }],
      }),
      approveSurvey: builder.mutation<
        ApiResponse<Omit<SurveyApproversResponse, "weekly_record">>,
        SurveyApproversSearchParams
      >({
        query: ({ id }) => ({
          url: `${CONFIG.ENDPOINTS.SURVEY_APPROVER}/${id}/approved`,
          method: "PATCH",
        }),
        invalidatesTags: (result, err, { id }) => [
          { type: CONFIG.ENDPOINTS.SURVEY_APPROVER, id: "LIST" },
          { type: CONFIG.ENDPOINTS.QA, id: "LIST" },
          { type: CONFIG.ENDPOINTS.QA, id },
        ],
      }),
      rejectSurvey: builder.mutation<
        ApiResponse<Omit<SurveyApproversResponse, "weekly_record">>,
        SurveyApproversSearchParams
      >({
        query: ({ id, remarks }) => ({
          url: `${CONFIG.ENDPOINTS.SURVEY_APPROVER}/${id}/rejected`,
          body: {
            approver_remarks: remarks,
          },
          method: "PATCH",
        }),
        invalidatesTags: (result, err, { id }) => [
          { type: CONFIG.ENDPOINTS.SURVEY_APPROVER, id: "LIST" },
          { type: CONFIG.ENDPOINTS.SURVEY_APPROVER, id },
          { type: CONFIG.ENDPOINTS.QA, id: "LIST" },
          { type: CONFIG.ENDPOINTS.QA, id },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useGetSurveyApproversQuery,
  useLazyGetSurveyApproversQuery,
  useApproveSurveyMutation,
  useRejectSurveyMutation,
} = surveyApproverApi;
