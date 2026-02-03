import * as React from 'react';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

/**
 * Pagination state interface to keep track of loading status and pagination info
 */
export interface PaginationState {
  loading: boolean;
  page: number;
  hasMore: boolean;
  totalPages?: number;
}

/**
 * Props for the PaginatedAutocomplete component
 * T is the type of the option object
 */
export interface PaginatedAutocompleteProps<
  T,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false
> extends Omit<
    AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
    'options' | 'loading' | 'loadingText'
  > {
  /**
   * Function to fetch the next page of options
   * @param page The page number to fetch (1-based)
   * @param searchTerm The current search term in the input
   * @returns Promise that resolves with the next page of options
   */
  fetchOptions: (page: number, searchTerm: string) => Promise<{
    data: T[];
    hasMore: boolean;
    totalPages?: number;
  }>;

  /**
   * Initial options to display before any pagination
   * @default []
   */
  initialOptions?: T[];

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
   * Function to determine if an option should be disabled
   * @param option The option to check
   * @returns True if the option should be disabled
   */
  getOptionDisabled?: (option: T) => boolean;

  /**
   * The number of items to fetch per page
   * @default 10
   */
  pageSize?: number;
}

/**
 * A paginated version of MUI's Autocomplete component that loads options from a server API
 * with support for pagination via a "Load More" button.
 */
export function PaginatedAutocomplete<
  T,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false
>({
  fetchOptions,
  initialOptions = [],
  loadingText = "Loading...",
  loadMoreText = "Load More",
  pageSize = 10,
  ...props
}: PaginatedAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) {
  // State to store the current options
  const [options, setOptions] = React.useState<T[]>(initialOptions);
  
  // Track input value for search filtering
  const [inputValue, setInputValue] = React.useState<string>('');
  
  // State to track pagination status
  const [paginationState, setPaginationState] = React.useState<PaginationState>({
    loading: false,
    page: 1,
    hasMore: true,
  });

  // Store if the dropdown is open
  const [open, setOpen] = React.useState(false);
  
  const theme = useTheme();

  // Load initial data when component mounts
  React.useEffect(() => {
    // Only fetch initial data if no initial options provided
    if (initialOptions.length === 0) {
      loadNextPage(1);
    }
  }, []);

  // Handle input value changes for search
  const handleInputChange = (
    event: React.SyntheticEvent,
    newInputValue: string
  ) => {
    setInputValue(newInputValue);
    
    // Call the original onInputChange if it exists
    if (props.onInputChange) {
      props.onInputChange(event, newInputValue, 'input');
    }
    
    // Reset pagination when search term changes
    if (newInputValue !== inputValue) {
      resetPagination(newInputValue);
    }
  };

  // Reset pagination and load first page with new search term
  const resetPagination = (searchTerm: string) => {
    setPaginationState({
      loading: true,
      page: 1,
      hasMore: true,
    });
    
    fetchOptions(1, searchTerm)
      .then(({ data, hasMore, totalPages }) => {
        setOptions(data);
        setPaginationState({
          loading: false,
          page: 1,
          hasMore: hasMore,
          totalPages: totalPages,
        });
      })
      .catch(() => {
        setPaginationState({
          loading: false,
          page: 1,
          hasMore: false,
        });
      });
  };

  // Load the next page of results
  const loadNextPage = (page: number) => {
    setPaginationState((prev) => ({
      ...prev,
      loading: true,
    }));

    fetchOptions(page, inputValue)
      .then(({ data, hasMore, totalPages }) => {
        // If it's the first page, replace options, otherwise append
        setOptions((prev) => (page === 1 ? data : [...prev, ...data]));
        
        setPaginationState({
          loading: false,
          page: page,
          hasMore: hasMore,
          totalPages: totalPages,
        });
      })
      .catch(() => {
        setPaginationState((prev) => ({
          ...prev,
          loading: false,
          hasMore: false,
        }));
      });
  };

  // Handle clicking the "Load More" button
  const handleLoadMore = () => {
    if (!paginationState.loading && paginationState.hasMore) {
      loadNextPage(paginationState.page + 1);
    }
  };

  // Custom Paper component to add the pagination controls
  const CustomPaper = (props: React.HTMLAttributes<HTMLElement>) => {
    return (
      <Paper {...props}>
        {props.children}
        {open && options.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing(1),
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            {paginationState.loading ? (
              <CircularProgress size={24} />
            ) : paginationState.hasMore ? (
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

  // Determine if we're in a loading state
  const isLoading = paginationState.loading && options.length === 0;

  return (
    <Autocomplete<T, Multiple, DisableClearable, FreeSolo>
      {...props}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={isLoading}
      loadingText={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>{loadingText}</Typography>
        </Box>
      }
      PaperComponent={CustomPaper}
      onInputChange={handleInputChange}
      filterOptions={(options) => options} // Disable client-side filtering since we're using server-side filtering
    />
  );
}

export default PaginatedAutocomplete;