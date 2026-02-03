import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define types based on your response structure
export interface GeneralInfo {
	prefix_id: string;
	id_number: string;
	first_name: string;
	middle_name: string;
	last_name: string;
	suffix: string;
	birthdate: string;
	religion: string;
	civil_status: string;
	gender: string;
	full_id_number: string;
	full_name: string;
	full_id_number_full_name: string;
	contact_details: string;
}

export interface PositionInfo {
	position_name: string;
	schedule: string | null;
	shift: string;
	team: string;
	tools: string;
}

export interface UnitInfo {
	department_name: string;
	subunit_name: string;
	jobband_name: string;
	location_name: string;
	division_name: string;
	category_name: string;
	company_name: string;
}

// This assumes that your actual API response has the 'data' property containing the array of CedarDataItems
export interface CedarDataItemResponse {
	data: CedarDataItem[]; // This will now have the `data` key
}

export interface CedarDataItem {
	general_info: GeneralInfo;
	position_info: PositionInfo;
	unit_info: UnitInfo;
}

export const cedarApi = createApi({
	reducerPath: "cedarApi",
	baseQuery: fetchBaseQuery({
		baseUrl: import.meta.env.VITE_CEDAR_ENDPOINT,
		prepareHeaders: (headers) => {
			headers.set("Authorization", `Bearer ${import.meta.env.VITE_CEDAR_BEARER_TOKEN}`);
			headers.set("Accept", "application/json");
			return headers;
		},
	}),

	tagTypes: ["Cedar"],
	endpoints: (builder) => ({
		getCedarData: builder.query<CedarDataItem[], { [key: string]: string }>({
			query: (params) => ({
				url: "",
				method: "GET",
				params: params,
			}),
			transformResponse: (response: CedarDataItemResponse) => {
				// Sort data: first by prefix alphabetically, then by numeric portion of full_id_number
				return response.data.sort((a, b) => {
					const [prefixA, numberA] = a.general_info.full_id_number.split("-");
					const [prefixB, numberB] = b.general_info.full_id_number.split("-");

					// First, compare alphabetically by the prefix
					if (prefixA !== prefixB) {
						return prefixA.localeCompare(prefixB);
					}

					// If the prefixes are the same, compare numerically by the numeric part
					const idNumberA = parseInt(numberA, 10);
					const idNumberB = parseInt(numberB, 10);
					return idNumberA - idNumberB; // Ascending order
				});
			},
			providesTags: ["Cedar"],
		}),
	}),
});

export const { useGetCedarDataQuery, useLazyGetCedarDataQuery } = cedarApi;
