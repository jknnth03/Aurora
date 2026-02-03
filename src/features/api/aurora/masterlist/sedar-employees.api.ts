import { CONFIG } from "../../../../config/config";
import {
  GeneralInfo,
  PositionInfo,
  UnitInfo,
} from "../../foreign-api/sedar.api";
import { api } from "../index.api";
import { UnpaginatedApiResponse } from "../types";
import { ISearchParams, ISearchParamsUnpaginated } from "./types";

export interface UserSearchParams extends ISearchParams {
  sorts?: string;
}

export interface UserSearchParamsUnpaginated extends ISearchParamsUnpaginated {
  sorts?: string;
}

export interface ISedarEmployeeResponse {
  general_info: GeneralInfo;
  position_info: PositionInfo;
  unit_info: UnitInfo;
}

export const sedarEmployeesApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.SEDAR_EMPLOYEES] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET - Read users with pagination
      getEmployees: builder.query<
        UnpaginatedApiResponse<ISedarEmployeeResponse>,
        UserSearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.SEDAR_EMPLOYEES,
          params: {
            ...params,
          },
        }),
        transformResponse: (
          response: UnpaginatedApiResponse<ISedarEmployeeResponse>
        ) => {
          if (response?.message === "Synching. Refresh the api") {
            throw new Error("Synching in progress. Please try again later.");
          }
          return response;
        },
        providesTags: (result) =>
          result
            ? [
                ...result.data.map(({ general_info }) => ({
                  type: CONFIG.ENDPOINTS.SEDAR_EMPLOYEES,
                  general_info,
                })),
                { type: CONFIG.ENDPOINTS.SEDAR_EMPLOYEES, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.SEDAR_EMPLOYEES, id: "LIST" }],
      }),
    }),
    overrideExisting: false,
  });

export const { useGetEmployeesQuery, useLazyGetEmployeesQuery } =
  sedarEmployeesApi;
