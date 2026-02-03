import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import {
  ApiResponse,
  PaginatedApiResponse,
  UnpaginatedApiResponse,
} from "../types";
import {
  IBusinessUnit,
  ICompany,
  IDepartment,
  ILocation,
  ISearchParams,
  ISearchParamsUnpaginated,
  ISubUnit,
  IUnit,
} from "./types";

export interface IOneCharging
  extends ICompany,
    IBusinessUnit,
    IDepartment,
    IUnit,
    ISubUnit,
    ILocation {
  id: number;
  name: string;
  sync_id: number;
  code: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IOneChargingSyncResponse {
  status: string;
  message: string;
  result: null;
}

export const oneChargingApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.ONE_CHARGING] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET - Read one chargings with pagination
      getOneChargings: builder.query<
        PaginatedApiResponse<IOneCharging>,
        ISearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.ONE_CHARGING,
          params: {
            ...params,
            pagination: true,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.ONE_CHARGING,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.ONE_CHARGING, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.ONE_CHARGING, id: "LIST" }],
      }),

      // GET - Read all one chargings without pagination
      getOneChargingsUnpaginated: builder.query<
        UnpaginatedApiResponse<IOneCharging>,
        ISearchParamsUnpaginated
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.ONE_CHARGING,
          params: { status: "active", ...params, pagination: "none" },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.ONE_CHARGING,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.ONE_CHARGING, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.ONE_CHARGING, id: "LIST" }],
      }),

      syncOneCharging: builder.mutation<IOneChargingSyncResponse, object>({
        query: () => ({
          url: `${CONFIG.ENDPOINTS.ONE_CHARGING}/system_sync`,
          method: "POST",
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.ONE_CHARGING, id: "LIST" }],
      }),

      updateOneCharging: builder.mutation<
        ApiResponse<IOneCharging>,
        { id: string; body: Partial<IOneCharging> }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.ONE_CHARGING}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.ONE_CHARGING, id },
        ],
      }),

      archiveOneCharging: builder.mutation<ApiResponse<null>, string>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.ONE_CHARGING}/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.ONE_CHARGING, id },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useLazyGetOneChargingsQuery,
  useGetOneChargingsQuery,
  useLazyGetOneChargingsUnpaginatedQuery,
  useGetOneChargingsUnpaginatedQuery,
  useSyncOneChargingMutation,
  useUpdateOneChargingMutation,
  useArchiveOneChargingMutation,
} = oneChargingApi;
