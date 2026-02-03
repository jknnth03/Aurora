import { CONFIG } from "../../../../config/config";
import { api } from "../index.api";
import { ApiResponse, PaginatedApiResponse } from "../types";
import { Company } from "./company.api";

export interface BusinessUnit {
	id: number;
	sync_id: number;
	business_unit_code: string;
	business_unit_name: string;
	company_id: number;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	company?: Company;
}

export interface BusinessUnitSearchParams {
	search?: string;
	pagination?: boolean;
	page?: number;
	per_page?: number;
	status?: "active" | "inactive";
	sorts?: string;
	company_id?: number;
}

export const businessUnitsApi = api
	.enhanceEndpoints({ addTagTypes: [CONFIG.ENDPOINTS.BUSINESS_UNITS] })
	.injectEndpoints({
		endpoints: (builder) => ({
			getBusinessUnits: builder.query<PaginatedApiResponse<BusinessUnit>, BusinessUnitSearchParams>({
				query: (params = {}) => ({
					url: CONFIG.ENDPOINTS.BUSINESS_UNITS,
					params,
				}),
				providesTags: (result) =>
					result
						? [
								...result.data.data.map(({ id }) => ({ type: CONFIG.ENDPOINTS.BUSINESS_UNITS, id })),
								{ type: CONFIG.ENDPOINTS.BUSINESS_UNITS, id: "LIST" },
						  ]
						: [{ type: CONFIG.ENDPOINTS.BUSINESS_UNITS, id: "LIST" }],
			}),

			getBusinessUnit: builder.query<ApiResponse<BusinessUnit>, string>({
				query: (id) => ({
					url: `${CONFIG.ENDPOINTS.BUSINESS_UNITS}/${id}`,
				}),
				providesTags: (result, error, id) => [{ type: CONFIG.ENDPOINTS.BUSINESS_UNITS, id }],
			}),

			createBusinessUnit: builder.mutation<ApiResponse<BusinessUnit>, Partial<BusinessUnit>>({
				query: (body) => ({
					url: CONFIG.ENDPOINTS.BUSINESS_UNITS,
					method: "POST",
					body,
				}),
				invalidatesTags: [{ type: CONFIG.ENDPOINTS.BUSINESS_UNITS, id: "LIST" }],
			}),

			updateBusinessUnit: builder.mutation<
				ApiResponse<BusinessUnit>,
				{ id: string; body: Partial<BusinessUnit> }
			>({
				query: ({ id, body }) => ({
					url: `${CONFIG.ENDPOINTS.BUSINESS_UNITS}/${id}`,
					method: "PATCH",
					body,
				}),
				invalidatesTags: (result, error, { id }) => [{ type: CONFIG.ENDPOINTS.BUSINESS_UNITS, id }],
			}),

			archiveBusinessUnit: builder.mutation<ApiResponse<null>, string>({
				query: (id) => ({
					url: `${CONFIG.ENDPOINTS.BUSINESS_UNITS}/${id}`,
					method: "DELETE",
				}),
				invalidatesTags: (result, error, id) => [{ type: CONFIG.ENDPOINTS.BUSINESS_UNITS, id }],
			}),
		}),
		overrideExisting: false,
	});

export const {
	useGetBusinessUnitsQuery,
	useGetBusinessUnitQuery,
	useCreateBusinessUnitMutation,
	useUpdateBusinessUnitMutation,
	useArchiveBusinessUnitMutation,
	useLazyGetBusinessUnitQuery,
	useLazyGetBusinessUnitsQuery,
} = businessUnitsApi;
