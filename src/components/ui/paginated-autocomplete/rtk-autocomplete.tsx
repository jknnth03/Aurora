import * as React from "react";
import {
	Autocomplete,
	AutocompleteProps,
	CircularProgress,
	Typography,
	Box,
	Button,
	Paper,
	useTheme,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

/**
 * Generic interface for RTK Query pagination response
 * Adapt this to match your API's pagination structure
 */
export interface PaginatedResponse<T> {
	data: T[]; // The array of items
	hasMore?: boolean; // Whether there are more pages
	totalPages?: number; // Total number of pages
	totalItems?: number; // Total number of items
	currentPage?: number; // Current page number
	// Add other pagination fields your API might use
}

/**
 * Generic interface for RTK Query pagination request
 */
export interface PaginationParams {
	page: number;
	limit?: number;
	search?: string;
	[key: string]: any; // Allow for additional custom parameters
}

/**
 * Props for the RTKAutocomplete component
 */
export interface RTKAutocompleteProps<
	T,
	Multiple extends boolean | undefined = false,
	DisableClearable extends boolean | undefined = false,
	FreeSolo extends boolean | undefined = false
> extends Omit<AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>, "options" | "loading" | "loadingText"> {
	/**
	 * Function to trigger the RTK Query request
	 * This should be the function returned by useLazyQuery
	 */
	queryFn: (params: PaginationParams) => Promise<{ data: PaginatedResponse<T> }>;

	/**
	 * Current page size to fetch
	 * @default 10
	 */
	pageSize?: number;

	/**
	 * Custom text to display when loading
	 * @default "Loading..."
	 */
	loadingText?: React.ReactNode;

	/**
	 * Custom text for the "Load More" button
	 * @default "Load More"
	 */
	loadMoreText?: React.ReactNode;

	/**
	 * Custom text to display when an error occurs
	 * @default "Error loading data. Try again."
	 */
	errorText?: React.ReactNode;

	/**
	 * Additional query parameters to include in each request
	 */
	additionalParams?: Partial<PaginationParams>;

	/**
	 * Callback when data is loaded
	 */
	onDataLoaded?: (data: T[]) => void;

	/**
	 * Whether to reset options when input changes
	 * @default true
	 */
	resetOnSearch?: boolean;

	/**
	 * Delay in ms before triggering a search after input change
	 * @default 300
	 */
	searchDelay?: number;
}

/**
 * A reusable Autocomplete component specifically designed for RTK Query
 * with built-in pagination support.
 */
export function RTKAutocomplete<
	T,
	Multiple extends boolean | undefined = false,
	DisableClearable extends boolean | undefined = false,
	FreeSolo extends boolean | undefined = false
>({
	queryFn,
	pageSize = 10,
	loadingText = "Loading...",
	loadMoreText = "Load More",
	errorText = "Error loading data. Try again.",
	additionalParams = {},
	onDataLoaded,
	resetOnSearch = true,
	searchDelay = 300,
	...props
}: RTKAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) {
	// State for options
	const [options, setOptions] = React.useState<T[]>([]);

	// Pagination state
	const [page, setPage] = React.useState(1);
	const [hasMore, setHasMore] = React.useState(true);
	const [totalPages, setTotalPages] = React.useState<number | undefined>(undefined);

	// Loading and error states
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<Error | null>(null);

	// Input value for search
	const [inputValue, setInputValue] = React.useState("");
	const [searchValue, setSearchValue] = React.useState("");

	// Track if dropdown is open
	const [open, setOpen] = React.useState(false);

	const theme = useTheme();

	// Debounce search input changes
	React.useEffect(() => {
		const handler = setTimeout(() => {
			if (inputValue !== searchValue) {
				setSearchValue(inputValue);

				if (resetOnSearch) {
					// Reset pagination when search term changes
					setPage(1);
					setOptions([]);
					fetchData(1, inputValue);
				}
			}
		}, searchDelay);

		return () => {
			clearTimeout(handler);
		};
	}, [inputValue, searchValue, resetOnSearch]);

	// Load initial data
	React.useEffect(() => {
		fetchData(1, "");
	}, []);

	// Fetch data from RTK Query
	const fetchData = async (pageNum: number, search: string) => {
		setLoading(true);
		setError(null);

		try {
			// Create request params
			const params: PaginationParams = {
				page: pageNum,
				limit: pageSize,
				search: search || undefined,
				...additionalParams,
			};

			// Execute the query
			const result = await queryFn(params);
			const response = result.data;

			// Update options - append or replace based on page number
			setOptions((prev) => (pageNum === 1 ? response.data : [...prev, ...response.data]));

			// Update pagination state
			setHasMore(response.hasMore ?? (response.totalPages ? pageNum < response.totalPages : false));
			setTotalPages(response.totalPages);

			// Call the onDataLoaded callback if provided
			if (onDataLoaded) {
				onDataLoaded(response.data);
			}
		} catch (err) {
			setError(err instanceof Error ? err : new Error("An error occurred while fetching data"));
			//console.error("Error fetching data:", err);
		} finally {
			setLoading(false);
		}
	};

	// Handle input value changes for search
	const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
		setInputValue(newInputValue);

		// Call the original onInputChange if it exists
		if (props.onInputChange) {
			props.onInputChange(event, newInputValue, "input");
		}
	};

	// Handle loading more results
	const handleLoadMore = () => {
		if (!loading && hasMore) {
			const nextPage = page + 1;
			setPage(nextPage);
			fetchData(nextPage, searchValue);
		}
	};

	// Custom Paper component to add pagination controls
	const CustomPaper = (props: React.HTMLAttributes<HTMLElement>) => {
		return (
			<Paper {...props}>
				{props.children}
				{open && options.length > 0 && (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							padding: theme.spacing(1),
							borderTop: `1px solid ${theme.palette.divider}`,
						}}
					>
						{error ? (
							<Typography variant="caption" color="error">
								{errorText}
							</Typography>
						) : loading && page > 1 ? (
							<CircularProgress size={24} />
						) : hasMore ? (
							<Button
								onClick={handleLoadMore}
								endIcon={<KeyboardArrowDownIcon />}
								size="small"
								fullWidth
								variant="text"
							>
								{loadMoreText}
							</Button>
						) : (
							<Typography variant="caption" color="text.secondary">
								{options.length === 0 ? "No results found" : "End of results"}
							</Typography>
						)}
					</Box>
				)}
			</Paper>
		);
	};

	return (
		<Autocomplete<T, Multiple, DisableClearable, FreeSolo>
			{...props}
			open={open}
			onOpen={() => setOpen(true)}
			onClose={() => setOpen(false)}
			options={options}
			loading={loading && page === 1}
			loadingText={
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<CircularProgress size={20} />
					<Typography>{loadingText}</Typography>
				</Box>
			}
			PaperComponent={CustomPaper}
			onInputChange={handleInputChange}
			filterOptions={(options) => options} // Disable client-side filtering
		/>
	);
}

export default RTKAutocomplete;
