import { CONFIG } from "../../../config/config";
import { api } from "./index.api";
import {
  IAreaHeadResponse,
  IAreaHeadSearchParams,
} from "./types/area-head-types";
import {
  ApiResponse,
  PaginatedApiResponse,
  UnpaginatedApiResponse,
} from "./types/types";

export const areaHeadApi = api
  .enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.AREA_HEAD] })
  .injectEndpoints({
    endpoints: (builder) => ({
      // GET - Read users with pagination
      getAreaHeads: builder.query<
        PaginatedApiResponse<IAreaHeadResponse>,
        IAreaHeadSearchParams
      >({
        query: (params = {}) => ({
          url: CONFIG.ENDPOINTS.AREA_HEAD,
          params: {
            ...params,
            user_type: "area_head",
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: CONFIG.ENDPOINTS.AREA_HEAD,
                  id,
                })),
                { type: CONFIG.ENDPOINTS.AREA_HEAD, id: "LIST" },
              ]
            : [{ type: CONFIG.ENDPOINTS.AREA_HEAD, id: "LIST" }],
      }),
    }),
    overrideExisting: false,
  });

export const { useGetAreaHeadsQuery } = areaHeadApi;
