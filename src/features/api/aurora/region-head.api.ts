import { CONFIG } from "../../../config/config";
import { api } from "./index.api";
import { IRegionHeadResponse } from "./types/region-types";
import { PaginatedApiResponse } from "./types/types";

export interface IRegionHeadSearchParams {
  search?: string;
  page?: number;
  per_page?: number;
  sorts?: string;
  status?: "active" | "inactive";
}

export const regionHeadApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.AREA_HEAD] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET - Read users with pagination
      getRegionHeads: builder.query<
        PaginatedApiResponse<IRegionHeadResponse>,
        IRegionHeadSearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.REGION_HEAD,
          params: {
            ...params,
            user_type: "region_head",
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.REGION_HEAD,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.REGION_HEAD, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.REGION_HEAD, id: "LIST" }],
      }),
    }),
    overrideExisting: false,
  });

export const { useGetRegionHeadsQuery } = regionHeadApi;
