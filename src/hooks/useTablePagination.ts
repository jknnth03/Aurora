import { useEffect, useMemo } from "react";
import { useRememberQueryParams } from "./useRememberQueryParams";
import { isEmpty } from "lodash";

interface UseTablePaginationOptions {
	defaultPage?: number;
	defaultRowsPerPage?: number;
	totalCount?: number;
	// API param names
	pageParam?: string;
	limitParam?: string;
	// Whether the API expects 0-based or 1-based pagination
	isZeroBased?: boolean;
}

export const useTablePagination = (options: UseTablePaginationOptions = {}) => {
	const {
		defaultPage = 1, // Default to page 1 (1-based for URL)
		defaultRowsPerPage = 25,
		totalCount = 0,
		pageParam = "page",
		limitParam = "per_page",
		isZeroBased = false,
	} = options;

	const { currentParams, setQueryParams } = useRememberQueryParams();

	// Get 1-based page from URL params (user-friendly URLs like page=1)
	const urlPage = currentParams[pageParam] !== undefined ? parseInt(currentParams[pageParam]) : defaultPage;
	const currentRowsPerPage =
		currentParams[limitParam] !== undefined ? parseInt(currentParams[limitParam]) : defaultRowsPerPage;

	// Convert to 0-based for MUI TablePagination (MUI expects pages 0, 1, 2...)
	const muiPage = Math.max(0, urlPage - 1);

	// Update URL when component mounts if pagination params are not present
	useEffect(() => {
		if (!isEmpty(currentParams)) {
			const paramsToUpdate: Record<string, number> = {};

			if (currentParams[pageParam] === undefined) {
				paramsToUpdate[pageParam] = defaultPage;
			}

			if (currentParams[limitParam] === undefined) {
				paramsToUpdate[limitParam] = defaultRowsPerPage;
			}

			if (Object.keys(paramsToUpdate).length > 0) {
				setQueryParams(paramsToUpdate, { retain: true });
			}
		}
	}, []);

	// Handle page change - MUI sends 0-based page, convert to 1-based for URL
	const handlePageChange = (_: unknown, newMuiPage: number) => {
		const newUrlPage = newMuiPage + 1; // Convert 0-based to 1-based
		setQueryParams({ [pageParam]: newUrlPage }, { retain: true });
	};

	// Handle rows per page change
	const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newRowsPerPage = parseInt(event.target.value, 10);
		// When changing rows per page, go back to first page (page 1 in URL)
		setQueryParams(
			{
				[limitParam]: newRowsPerPage,
				[pageParam]: 1, // Reset to page 1 (1-based for URL)
			},
			{ retain: true }
		);
	};

	// Params to send to the API
	const paginationParams = useMemo(() => {
		const apiPage = isZeroBased ? muiPage : urlPage; // Use 0-based or 1-based as needed by API
		return {
			[pageParam]: apiPage,
			[limitParam]: currentRowsPerPage,
		};
	}, [muiPage, urlPage, currentRowsPerPage, pageParam, limitParam, isZeroBased]);

	// Props to send to MUI TablePagination (0-based)
	const pagination = {
		count: totalCount,
		page: muiPage, // 0-based for MUI
		rowsPerPage: currentRowsPerPage,
		onPageChange: handlePageChange,
		onRowsPerPageChange: handleRowsPerPageChange,
	};

	return { pagination, paginationParams };
};
