import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import { ApiResponse, PaginatedApiResponse } from "../types";
import { SubUnit } from "./sub-unit.api";

export interface Location {
  id: number;
  sync_id: number;
  location_code: string;
  location_name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sub_unit?: SubUnit[];
}

export interface LocationSearchParams extends ISearchParams {
  sorts?: string;
  sub_unit_id?: number;
}

export const locationApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.LOCATION] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getLocations: builder.query<
        PaginatedApiResponse<Location>,
        LocationearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.LOCATION,
          params,
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.LOCATION,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.LOCATION, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.LOCATION, id: "LIST" }],
      }),

      getLocation: builder.query<ApiResponse<Location>, string>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.LOCATION}/${id}`,
        }),
        providesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.LOCATION, id },
        ],
      }),

      createLocation: builder.mutation<
        ApiResponse<Location>,
        Partial<Location>
      >({
        query: (body) => ({
          url: CONFIG.ENDPOINTS.LOCATION,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: CONFIG.ENDPOINTS.LOCATION, id: "LIST" }],
      }),

      updateLocation: builder.mutation<
        ApiResponse<Location>,
        { id: string; body: Partial<Location> }
      >({
        query: ({ id, body }) => ({
          url: `${CONFIG.ENDPOINTS.LOCATION}/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: CONFIG.ENDPOINTS.LOCATION, id },
        ],
      }),

      archiveLocation: builder.mutation<ApiResponse<null>, string>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.LOCATION}/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: CONFIG.ENDPOINTS.LOCATION, id },
        ],
      }),

      attachSubUnitToLocation: builder.mutation<
        ApiResponse<null>,
        { locationId: string; subUnitId: string }
      >({
        query: ({ locationId, subUnitId }) => ({
          url: `${CONFIG.ENDPOINTS.LOCATION}/${locationId}/attach-sub-unit/${subUnitId}`,
          method: "POST",
        }),
        invalidatesTags: (result, error, { locationId }) => [
          { type: CONFIG.ENDPOINTS.LOCATION, id: locationId },
          { type: CONFIG.ENDPOINTS.LOCATION, id: "LIST" },
        ],
      }),

      detachSubUnitFromLocation: builder.mutation<
        ApiResponse<null>,
        { locationId: string; subUnitId: string }
      >({
        query: ({ locationId, subUnitId }) => ({
          url: `${CONFIG.ENDPOINTS.LOCATION}/${locationId}/detach-sub-unit/${subUnitId}`,
          method: "POST",
        }),
        invalidatesTags: (result, error, { locationId }) => [
          { type: CONFIG.ENDPOINTS.LOCATION, id: locationId },
          { type: CONFIG.ENDPOINTS.LOCATION, id: "LIST" },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useGetLocationsQuery,
  useGetLocationQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useArchiveLocationMutation,
  useAttachSubUnitToLocationMutation,
  useDetachSubUnitFromLocationMutation,
  useLazyGetLocationQuery,
  useLazyGetLocationsQuery,
} = locationApi;
