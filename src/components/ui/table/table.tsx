import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination, {
  TablePaginationProps,
} from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bomb,
  DotsThreeOutlineVertical,
  MouseRightClick,
} from "@phosphor-icons/react";
import React, {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParallelScroll } from "../../../hooks/useParellelScroll";
import { useSortedTable } from "../../../hooks/useSortedTable";
import ContextMenu, { ContextMenuItem } from "../context-menu/context-menu";
import useContextMenu from "../context-menu/useContextMenu";
import CoolTip from "../cool-tip/cool-tip";
import IconToggle from "../icon-toggle/icon-toggle";

// Improved type for cell values with generics
export type PrimitiveValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;
export type ObjectValue = Record<string, unknown>;
export type ArrayValue = unknown[];
export type CellValue<T = unknown> =
  | PrimitiveValue
  | ObjectValue
  | ArrayValue
  | T;

// Updated to allow for complex nested object access with path strings
export interface ITableColumn<T, K = unknown> {
  id: string;
  uniqueId?: string;
  label: string;
  getValue: (item: T, index?: number) => CellValue<K>;
  getExportValue?: (item: T) => string;
  renderCell?: (value: CellValue<K>, item: T) => ReactNode; // Added item parameter for access to full row
  sortable?: boolean;
  width?: string | number; // Optional width for the column
}

/**
 * Interface for row identification and expansion controls
 * This interface makes it easier to integrate with useRowExpansion hook
 */
export interface RowExpansionControls<T> {
  // Required props
  expandedRows: Record<string, boolean>;

  // Optional props
  getRowId?: (item: T, index: number) => string;
  onExpandedRowsChange?: (expandedRows: Record<string, boolean>) => void;
  allExpanded?: boolean;
  onAllExpandedChange?: (expanded: boolean) => void;
}

// Updated ITable interface to include right-click menu options, row expansion controls, and actions column
export interface ITable<T> extends RowExpansionControls<T> {
  columns: Array<ITableColumn<T, unknown>>;
  data: T[];
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  disabled?: boolean;
  isFetching?: boolean;
  error?: string;
  skeletonRows?: number;
  collapseValue?: (item: T) => ReactNode;
  pagination?: TablePaginationProps;
  onRowClick?: (rowData: T) => void;
  rightClickMenuItems?: (item: T) => ContextMenuItem<T>[]; // Right-click menu items function
  actions?: (item: T) => ContextMenuItem<T>[]; // Actions column items function
  actionsColumnWidth?: string | number; // Width for actions column
  showRightClickLabel?: boolean;
  // New prop to control if expand/collapse should be auto-added to right-click menu
}

function SortIcon({ className }: { className: string }) {
  return <ArrowUp size={16} className={className} />;
}

// Type guard for checking if an object has an ID property
function hasIdProperty(item: unknown): item is { id: string | number } {
  return (
    typeof item === "object" &&
    item !== null &&
    "id" in item &&
    (typeof (item as { id: unknown }).id === "string" ||
      typeof (item as { id: unknown }).id === "number")
  );
}

function TableComponent<T extends { uniqueId: string | number }>({
  columns,
  data,
  isLoading = false,
  disabled = false,
  isError = false,
  isFetching = false,
  error = "No Data Found",
  skeletonRows = 5,
  collapseValue,
  pagination,
  onRowClick,
  rightClickMenuItems,
  actions,
  actionsColumnWidth = 100,
  // Row expansion props
  expandedRows,
  getRowId: externalGetRowId,
  onExpandedRowsChange,
  allExpanded = false,
  onAllExpandedChange,
  showRightClickLabel = true,
}: ITable<T>) {
  const { refs: horizontalRefs } = useParallelScroll<HTMLDivElement>({
    count: 2,
    syncVertical: true,
    syncHorizontal: true,
  });

  // Create internal state for expandedRows if not controlled externally
  const [internalExpandedRows, setInternalExpandedRows] = useState<
    Record<string, boolean>
  >({});
  const [internalAllExpanded, setInternalAllExpanded] =
    useState<boolean>(false);

  // Determine if component is controlled externally
  const isControlled =
    expandedRows !== undefined && onExpandedRowsChange !== undefined;
  const isAllExpandedControlled =
    allExpanded !== undefined && onAllExpandedChange !== undefined;

  // Should show action column
  // Determine if the action column should be shown
  const shouldShowActionColumn =
    actions || // Show if there are actions
    (rightClickMenuItems && showRightClickLabel) || // Show if right-click menu should display label
    collapseValue; // Show if collapseValue is truthy

  // Use either controlled or uncontrolled state
  const effectiveExpandedRows = isControlled
    ? expandedRows
    : internalExpandedRows;
  const effectiveAllExpanded = isAllExpandedControlled
    ? allExpanded
    : internalAllExpanded;

  const columnsForSorting = columns.map((col) => ({
    id: col.id,
    getValue: col.getValue,
  }));

  // Use our custom hook for context menu instead of local state
  const { contextMenu, handleContextMenu, handleCloseContextMenu } =
    useContextMenu<T>();

  // State for actions menu (manual state management)
  const [actionsContextMenu, setActionsContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    item: T;
  } | null>(null);

  const { sortedData, requestSort, resetSort, sortKey, sortOrder } =
    useSortedTable(data, columnsForSorting);

  // Add event listener to handle right-clicks outside the table
  useEffect(() => {
    const handleGlobalContextMenu = (event: MouseEvent) => {
      // Check if right-click is outside our table component
      // If the context menu is open, prevent default behavior
      if (contextMenu !== null) {
        event.preventDefault();
      }
    };

    // Add global context menu handler
    document.addEventListener("contextmenu", handleGlobalContextMenu);

    return () => {
      // Clean up the event listener when component unmounts
      document.removeEventListener("contextmenu", handleGlobalContextMenu);
    };
  }, [contextMenu]);

  // Get a unique ID for each row
  const getRowId = useCallback(
    (
      item: T & Partial<{ uniqueId?: string | number | undefined }>,
      index: number,
    ): string => {
      // Use external getRowId if provided
      if (
        item &&
        typeof item === "object" &&
        "uniqueId" in item &&
        item.uniqueId !== undefined
      )
        return item.uniqueId.toString();
      if (externalGetRowId) {
        return externalGetRowId(item, index);
      }

      // Default implementation with proper type checking
      if (hasIdProperty(item)) {
        return String(item.id);
      }

      // Fallback to index
      return `row-${index}`;
    },
    [externalGetRowId],
  );

  // Function to update expanded rows state
  const updateExpandedRows = useCallback(
    (newExpandedRows: Record<string, boolean>) => {
      if (isControlled) {
        onExpandedRowsChange?.(newExpandedRows);
      } else {
        setInternalExpandedRows(newExpandedRows);
      }
    },
    [isControlled, onExpandedRowsChange],
  );

  // Function to update allExpanded state
  const updateAllExpanded = useCallback(
    (newAllExpanded: boolean) => {
      if (isAllExpandedControlled) {
        onAllExpandedChange?.(newAllExpanded);
      } else {
        setInternalAllExpanded(newAllExpanded);
      }
    },
    [isAllExpandedControlled, onAllExpandedChange],
  );

  // Toggle a row's expanded state
  const toggleRowExpansion = useCallback(
    (rowId: string) => {
      updateExpandedRows({
        ...effectiveExpandedRows,
        [rowId]: effectiveExpandedRows ? !effectiveExpandedRows[rowId] : false,
      });
    },
    [effectiveExpandedRows, updateExpandedRows],
  );

  // Toggle all rows expanded/collapsed
  const toggleAllExpanded = useCallback(() => {
    const newExpandedState = !effectiveAllExpanded;
    updateAllExpanded(newExpandedState);

    // Update all rows based on the new state
    if (newExpandedState) {
      // Expand all rows
      const newExpandedRows: Record<string, boolean> = {};
      sortedData.forEach((item, index) => {
        const rowId = getRowId(item, index);
        newExpandedRows[rowId] = true;
      });
      updateExpandedRows(newExpandedRows);
    } else {
      // Collapse all rows
      updateExpandedRows({});
    }
  }, [
    effectiveAllExpanded,
    updateAllExpanded,
    sortedData,
    getRowId,
    updateExpandedRows,
  ]);

  // Check if a row is expanded
  const isRowExpanded = useCallback(
    (rowId: string): boolean => {
      return Boolean(
        effectiveExpandedRows ? effectiveExpandedRows[rowId] : false,
      );
    },
    [effectiveExpandedRows],
  );

  // Enhanced right-click menu items that automatically includes expand/collapse
  const getEnhancedRightClickMenuItems = useCallback(
    (item: T): ContextMenuItem<T>[] => {
      const userMenuItems = rightClickMenuItems
        ? rightClickMenuItems(item)
        : [];

      // Only add expand/collapse if collapseValue exists and autoAddExpandToMenu is true
      if (!collapseValue) {
        return userMenuItems;
      }

      // Find the index of this item in sortedData to generate the correct rowId
      const index = sortedData.findIndex((dataItem) => {
        // Try to match by id if available
        if (hasIdProperty(item) && hasIdProperty(dataItem)) {
          return item.id === dataItem.id;
        }
        // Fallback to reference equality
        return dataItem === item;
      });

      const rowId = getRowId(item, index);
      const isExpanded = isRowExpanded(rowId);

      const expandCollapseMenuItem: ContextMenuItem<T> = {
        id: `toggle-expand-${rowId}`,
        label: isExpanded ? "Collapse Details" : "Expand Details",
        icon: (
          <IconToggle
            defaultOrientation={90}
            isExpanded={isExpanded}
            rotationDirection={270}
          />
        ),
        onClick: () => toggleRowExpansion(rowId),
      };

      // Add expand/collapse at the beginning, followed by a divider if user has menu items
      if (userMenuItems.length > 0) {
        return [expandCollapseMenuItem, ...userMenuItems];
      }

      // If no user menu items, just return the expand/collapse item
      return [expandCollapseMenuItem];
    },
    [
      rightClickMenuItems,
      collapseValue,
      sortedData,
      getRowId,
      isRowExpanded,
      toggleRowExpansion,
    ],
  );

  // Handle actions menu
  const handleActionsClick = (
    event: React.MouseEvent<HTMLElement>,
    item: T,
  ) => {
    event.stopPropagation();
    event.preventDefault();

    // Get button position for menu placement
    const rect = event.currentTarget.getBoundingClientRect();

    setActionsContextMenu({
      mouseX: rect.right,
      mouseY: rect.bottom,
      item: item,
    });
  };

  const handleCloseActionsContextMenu = () => {
    setActionsContextMenu(null);
  };

  const renderCellContent = <K,>(
    column: ITableColumn<T, K>,
    item: T,
  ): React.ReactNode => {
    const value = column.getValue(item);

    if (column.renderCell) {
      return column.renderCell(value, item); // Pass both value and full item
    }

    if (value === null || value === undefined) {
      return "";
    }

    // Handle complex nested objects
    if (typeof value === "object" && value !== null) {
      try {
        return JSON.stringify(value);
      } catch (error) {
        console.error(error);
        return "[Complex Object]";
      }
    }

    return String(value);
  };

  const renderSkeletonRows = () => {
    return Array(skeletonRows)
      .fill(null)
      .map((_, rowIndex) => (
        <TableRow key={`skeleton-${rowIndex}`}>
          {collapseValue &&
            !columns.some((col) => col.id === "expand_control") && (
              <TableCell>
                <Skeleton animation="wave" width={20} />
              </TableCell>
            )}
          {columns.map((column) => (
            <TableCell
              key={`skeleton-${column.id}`}
              sx={{ width: column.width }}>
              <Skeleton animation="wave" width={"100%"} />
            </TableCell>
          ))}
          {shouldShowActionColumn && (
            <TableCell sx={{ width: actionsColumnWidth }}>
              <Skeleton animation="wave" width={20} />
            </TableCell>
          )}
        </TableRow>
      ));
  };

  // Handle row click
  const handleRowClick = (item: T) => {
    if (onRowClick) {
      onRowClick(item);
    }
  };

  // Calculate total colspan for error/empty states
  const getTotalColspan = () => {
    let colSpan = columns.length;
    if (collapseValue && !columns.some((col) => col.id === "expand_control")) {
      colSpan += 1;
    }
    if (shouldShowActionColumn) {
      colSpan += 1;
    }
    return colSpan;
  };

  const renderTableContent = () => {
    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={getTotalColspan()}>
            <Alert
              severity="error"
              sx={{ my: 2 }}
              icon={<Bomb color="var(--error-main)" weight="fill" />}>
              {error}
            </Alert>
          </TableCell>
        </TableRow>
      );
    }

    if (isLoading || isFetching) {
      return renderSkeletonRows();
    }

    if (sortedData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={getTotalColspan()} align="center" sx={{ py: 3 }}>
            No data available
          </TableCell>
        </TableRow>
      );
    }

    return sortedData.map(
      (item: T & { uniqueId?: string | number }, rowIndex) => {
        const rowId = getRowId(item, rowIndex);
        const isExpanded = isRowExpanded(rowId);

        return (
          <Fragment key={rowId}>
            <TableRow
              sx={{
                ":hover": { backgroundColor: "var(--background-main)" },
                cursor: onRowClick || collapseValue ? "pointer" : "default",
              }}
              onClick={(e) => {
                // Only handle click if it's not on the expand button or actions button
                const target = e.target as HTMLElement;
                if (
                  e.currentTarget === e.target ||
                  !e.currentTarget.contains(target) ||
                  !target.closest("button")
                ) {
                  handleRowClick(item);
                }
              }}
              onContextMenu={(e) => {
                // Use enhanced menu items if we have right-click functionality or collapse functionality
                handleContextMenu(e, item);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                toggleRowExpansion(rowId);
              }}>
              {collapseValue &&
                !columns.some((col) => col.id === "expand_control") && (
                  <TableCell
                    width={500}
                    sx={{ borderBottom: 0, width: 50 }}
                    onContextMenu={(e) => {
                      handleContextMenu(e, item);
                    }}>
                    <CoolTip title="Expand this row" placement="left">
                      <IconButton
                        size="small"
                        onClick={() => {
                          toggleRowExpansion(rowId);
                        }}>
                        <IconToggle isExpanded={isExpanded} />
                      </IconButton>
                    </CoolTip>
                  </TableCell>
                )}
              {columns.map((column) => (
                <TableCell
                  id={column.id}
                  sx={{
                    borderBottom: collapseValue ? 0 : undefined,
                    textAlign: "center",
                  }}
                  key={column.id}
                  onContextMenu={(e) => {
                    if (rightClickMenuItems || collapseValue) {
                      handleContextMenu(e, item);
                    }
                  }}>
                  {renderCellContent(column, item)}
                </TableCell>
              ))}
              {shouldShowActionColumn && (
                <TableCell
                  sx={{
                    borderBottom: collapseValue ? 0 : "1 solid gray",
                    width: actionsColumnWidth,
                  }}
                  onContextMenu={(e) => {
                    if (rightClickMenuItems || collapseValue) {
                      handleContextMenu(e, item);
                    }
                  }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                    }}>
                    {showRightClickLabel &&
                      actions != undefined &&
                      actions(item).length > 0 && (
                        <CoolTip title="Right-click enabled.">
                          <MouseRightClick weight="fill" />
                        </CoolTip>
                      )}
                    {actions != undefined && actions(item).length > 0 && (
                      <CoolTip title="Actions" placement="left">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            if (actions(item).length > 0)
                              handleActionsClick(e, item);
                          }}
                          disabled={actions(item).length == 0}>
                          <DotsThreeOutlineVertical size={16} weight="fill" />
                        </IconButton>
                      </CoolTip>
                    )}
                  </Box>
                </TableCell>
              )}
            </TableRow>
            {collapseValue && (
              <TableRow>
                <TableCell
                  sx={{ paddingBottom: 0, paddingTop: 0, paddingX: 4 }}
                  colSpan={getTotalColspan()}
                  onContextMenu={(e) => {
                    handleContextMenu(e, item);
                  }}>
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>{collapseValue(item)}</Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            )}
          </Fragment>
        );
      },
    );
  };

  return (
    <>
      {/* Fixed Header */}
      <Stack flex={1} overflow={"hidden"} gap={0}>
        <TableContainer
          ref={horizontalRefs[0]}
          component={Paper}
          sx={{
            position: "sticky",
            top: 0,
            overflow: "hidden",
            zIndex: 1,
            borderBottomLeftRadius: 0,
            scrollbarGutter: `stable`,
            backgroundColor: "primary.main",
            borderBottomRightRadius: 0,
          }}>
          <Table sx={{ tableLayout: "fixed" }} size="small">
            <TableHead>
              <TableRow>
                {collapseValue && (
                  <TableCell sx={{ width: 50, border: "none" }}>
                    <CoolTip title="Expand all rows" placement="left">
                      <IconButton onClick={toggleAllExpanded} size="small">
                        <IconToggle isExpanded={effectiveAllExpanded} />
                      </IconButton>
                    </CoolTip>
                  </TableCell>
                )}
                {columns.map((column) => {
                  const isSortable = column.sortable ?? false;

                  return (
                    <TableCell
                      key={column.id}
                      sx={{
                        border: "none",
                        cursor: isSortable ? "pointer" : "default",
                        userSelect: "none",
                        width: column.width,
                        textAlign: "center",
                      }}
                      onDoubleClick={isSortable ? () => resetSort() : undefined}
                      onClick={
                        isSortable ? () => requestSort(column.id) : undefined
                      }>
                      {isSortable ? (
                        <TableSortLabel
                          IconComponent={SortIcon}
                          sx={{
                            color: "primary.contrastText",
                            "&.Mui-active": {
                              color: "primary.contrastText",
                              fontWeight: "bold",
                            },
                            ":hover": { color: "secondary.light" },
                            textAlign: "center",
                            width: "100%",
                            "& .MuiTableSortLabel-icon": {
                              opacity: 1, // Always show the icon
                            },
                          }}
                          active={sortKey === column.id}
                          direction={sortKey === column.id ? sortOrder : "asc"}
                          hideSortIcon={false} // Add this prop
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ margin: "0 auto", width: "100%" }}>
                            {column.label}
                          </Typography>
                        </TableSortLabel>
                      ) : (
                        <Typography
                          variant="subtitle2"
                          sx={{ margin: "0 auto" }}>
                          {column.label}
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
                {shouldShowActionColumn && (
                  <TableCell sx={{ width: actionsColumnWidth, border: "none" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                      }}>
                      <Typography variant="subtitle2">Actions</Typography>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>

        <TableContainer
          ref={horizontalRefs[1]}
          component={Paper}
          sx={{
            flex: 1,
            position: "relative",
            overflow: "auto",
            maxHeight: "calc(100vh - 120px)", // Adjust based on your header height
            marginTop: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            scrollbarGutter: `stable`,
            "&::-webkit-scrollbar-track": {
              // backgroundColor: "primary.main",
              borderRadius: "0 10px 10px 0 ",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "primary.main",
            },
          }}
          onContextMenu={(e) => {
            if (rightClickMenuItems || collapseValue) {
              e.preventDefault();
            }
          }}>
          <Table
            size="small"
            sx={{
              tableLayout: "fixed",
            }}
            aria-label="table body">
            {/* Invisible header to maintain column alignment */}
            <TableHead sx={{ visibility: "hidden", height: 0 }}>
              <TableRow sx={{ height: 0 }}>
                {collapseValue && (
                  <TableCell
                    sx={{ width: 50, height: 0, padding: 0, border: "none" }}
                  />
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{
                      width: column.width,
                      height: 0,
                      padding: 0,
                      border: "none",
                    }}
                  />
                ))}
                {(actions || shouldShowActionColumn) && (
                  <TableCell
                    sx={{
                      width: actionsColumnWidth,
                      height: 0,
                      padding: 0,
                      border: "none",
                    }}
                  />
                )}
              </TableRow>
            </TableHead>
            <TableBody>{renderTableContent()}</TableBody>
          </Table>
        </TableContainer>
      </Stack>

      {pagination && (
        <TablePagination
          sx={{
            height: "50px",
            width: "fit-content",
            position: "absolute",
            bottom: 0,
            right: 20,
            overflow: "hidden",
          }}
          slots={{
            actions: {
              nextButtonIcon: ArrowRight,
              previousButtonIcon: ArrowLeft,
            },
          }}
          labelRowsPerPage=""
          size="small"
          component={"div"}
          {...pagination}
        />
      )}

      {/* Context Menu Component - Now uses enhanced menu items */}
      {(rightClickMenuItems || collapseValue) && (
        <ContextMenu
          disabled={disabled}
          contextMenu={contextMenu || null}
          menuItems={getEnhancedRightClickMenuItems}
          onClose={handleCloseContextMenu}
        />
      )}

      {/* Actions Menu using ContextMenu */}
      {actions && (
        <ContextMenu
          disabled={disabled}
          contextMenu={actionsContextMenu || null}
          menuItems={actions}
          onClose={handleCloseActionsContextMenu}
        />
      )}
    </>
  );
}

export default TableComponent;
