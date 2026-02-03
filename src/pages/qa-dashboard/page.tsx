import { FrameCorners } from "@phosphor-icons/react";
import MasterlistLayout from "../../components/layout/masterlist-layout/masterlist-layout";
import { MODULES } from "../../config/modules/modules";
import { PhosphorIcon } from "../../hooks/usePhosphorIcon";
import TableComponent, { ITableColumn } from "../../components/ui/table/table";
import { useMemo, useState } from "react";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import { useTablePagination } from "../../hooks/useTablePagination";
import { useGetQAsQuery } from "../../features/api/aurora/qa-dashboard.api";
import { ContextMenuItem } from "../../components/ui/context-menu/context-menu";
import { enqueueSnackbar } from "notistack";
import {
  ApiError,
  UnpaginatedApiResponse,
} from "../../features/api/aurora/types/types.ts";
import StatusChip from "./components/status-chip";
import { useOpenChecklist } from "../../hooks/useOpenChecklist.ts";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import {
  IRegionResponse,
  useLazyGetUnpaginatedRegionsQuery,
} from "../../features/api/aurora/masterlist/regions.api.ts";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import {
  IAreaResponse,
  useLazyGetUnpaginatedAreasQuery,
} from "../../features/api/aurora/masterlist/areas.api.ts";
import { getData } from "../../features/slices/qaDashboard-slice.ts";
import { useDispatch } from "react-redux";
import MonthYearFilter from "./components/month-year-filter.tsx";
import moment from "moment";
import { IQADashboardResponse } from "../../features/api/aurora/types/qa-dashboard-types.ts";

const QADashboard = () => {
  // State for expanded rows
  const [isOpenRegions, setIsOpenRegions] = useState(false);
  const [regions, setRegions] = useState<IRegionResponse[] | null>(null);
  const [region, setRegion] = useState<IRegionResponse | null>(null);
  const [isOpenAreas, setIsOpenAreas] = useState(false);
  const [areas, setAreas] = useState<IAreaResponse[] | null>(null);
  const [area, setArea] = useState<IAreaResponse | null>(null);
  const [date, setDate] = useState(new Date());

  const currentMonth = date?.getMonth() + 1;
  const currentYear = date?.getFullYear();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>();
  const { currentParams } = useRememberQueryParams();
  const dispatch = useDispatch();
  const { open: openQAChecklistDialog } = useOpenChecklist();

  // Use the pagination hook
  const { pagination, paginationParams } = useTablePagination({
    defaultRowsPerPage: 25,
    totalCount: 0,
    isZeroBased: false,
  });
  const {
    data: qaItems,
    isLoading,
    isFetching,
    isError,
  } = useGetQAsQuery({
    search: currentParams?.q,
    page: paginationParams.page,
    per_page: paginationParams.per_page,
    status: "active",
    month: date?.getMonth() + 1,
    year: date?.getFullYear(),
    region: region?.name || "",
    area: area?.name || "",
  });

  // Update total count when data is loaded
  if (
    qaItems?.data.total !== undefined &&
    pagination.count !== qaItems.data.total
  ) {
    pagination.count = qaItems.data.total;
  }

  // Define strongly-typed columns for the UserResult data
  const columns: Array<ITableColumn<Partial<IQADashboardResponse>, unknown>> = [
    {
      id: "idnumber",
      label: "ID No",
      uniqueId: "id",
      getValue: (qaItem) => `${qaItem.id}`,
      sortable: true,
    },
    {
      id: "region",
      label: "Region",
      getValue: (qaItem) => qaItem.region?.name,
      sortable: true,
    },

    {
      id: "area",
      label: "Area",
      getValue: (qaItem) => qaItem.area?.name,
      // renderCell: (value) => value,
      sortable: true,
    },
    {
      id: "grade",
      label: "Grade",
      getValue: (qaItem) => {
        const gradeSum =
          qaItem?.store_checklist?.[0]?.weekly_record
            ?.filter((record) => record.store_visit === null)
            ?.reduce((acc, cur) => {
              acc += Number(cur.weekly_grade);
              return acc;
            }, 0) || 0;
        const gradeAvg =
          gradeSum / (qaItem?.store_checklist?.[0]?.weekly_record?.length || 1);
        return gradeAvg.toFixed(2) + "%";
      },
    },
    {
      id: "location",
      label: "Location",
      getValue: (qaItem) => qaItem.name,
      sortable: true,
    },
    {
      id: "quality_audit",
      label: "Quality Audit",
      getValue: (qaItem) => {
        const startOfMonth = moment().startOf("month");
        let mondayCount = 0;
        const day = startOfMonth.clone();
        const weekStore = qaItem?.store_checklist
          ?.map((checklistItem) => {
            return checklistItem.weekly_record.map((record) => {
              return record;
            });
          })
          .flat();
        while (mondayCount < 4) {
          if (day.day() === 1) {
            mondayCount++;
          }
          day.add(1, "day");
        }
        return `${weekStore?.length || 0} / ${mondayCount}`;
      },
      sortable: true,
    },
    {
      id: "status",
      label: "Status",
      getValue: () => {},
      renderCell: (_unused, item) => {
        const startOfMonth = moment().startOf("month");
        const endOfMonth = moment().endOf("month");
        let mondayCount = 0;
        const day = startOfMonth.clone();
        while (day.isSameOrBefore(endOfMonth)) {
          if (day.day() === 1) {
            mondayCount++;
          }
          day.add(1, "day");
        }
        const weekStoreAreAllCompleted =
          item?.store_checklist?.[0]?.weekly_record?.every(
            (record) => record.status === "Completed"
          );
        const weekStoreSomeOverdue =
          item?.store_checklist?.[0]?.weekly_record?.some(
            (record) => record.status === "Overdue"
          );
        const weekStore = item?.store_checklist?.[0]?.weekly_record;
        const isComplete =
          weekStore?.length == mondayCount && weekStoreAreAllCompleted;
        const isEmptyWeekRecords =
          typeof item?.store_checklist?.[0]?.weekly_record == "undefined";
        const isRejected = weekStore?.some(
          (record) => record.status === "Rejected"
        );
        const hasApproval = item?.store_checklist?.[0]?.weekly_record?.some(
          (record) => record.status === "For Approval"
        );
        let status;
        if (hasApproval) {
          status = "For Approval";
        } else if (isRejected) {
          status = "Rejected";
        } else if (weekStoreSomeOverdue && !isEmptyWeekRecords) {
          status = "Overdue";
        } else if (isComplete) {
          status = "Completed";
        } else {
          status = "Pending";
        }
        return <StatusChip status={status} key={item.id} />;
      },
      width: 150,
    },
  ];

  // Right-click menu items
  const getRightClickMenuItems = (
    qaItem: IQADashboardResponse
  ): Array<ContextMenuItem<IQADashboardResponse>> => [
    {
      id: `view-${qaItem.id}`,
      label: "View Data",
      icon: <FrameCorners />,
      onClick: () => {
        openQAChecklistDialog(MODULES.QA.ALIAS, qaItem.id);
        dispatch(
          getData({
            touchedData: {
              ...qaItem,
              month: currentMonth,
              year: currentYear,
              isViewing: true,
            },
          })
        );
      },
    },
  ];

  const transformedData = useMemo<IQADashboardResponse[]>(() => {
    const rows = qaItems?.data.data;
    const finalData = rows;
    return finalData || [];
  }, [qaItems?.data.data]);

  const [
    getRegions,
    { isLoading: isLoadingRegions, isFetching: isFetchingRegions },
  ] = useLazyGetUnpaginatedRegionsQuery();

  const handleOpenRegions = async () => {
    setIsOpenRegions(true);
    try {
      const response: UnpaginatedApiResponse<IRegionResponse> =
        await getRegions({ status: "active" }).unwrap();
      const regions = response.data;
      setRegions(regions);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 422) {
        enqueueSnackbar(apiError.detail, { variant: "error" });
      } else {
        enqueueSnackbar("An unexpected error has occured", {
          variant: "error",
        });
      }
    }
  };

  const handleCloseRegions = () => {
    setIsOpenRegions(false);
  };

  const renderRegions = () => {
    return (
      <Autocomplete
        sx={{ width: "150px" }}
        options={regions ?? []}
        onOpen={handleOpenRegions}
        onClose={handleCloseRegions}
        open={isOpenRegions}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(_, value) => setRegion(value)}
        getOptionLabel={(option) => option.name}
        value={region}
        loading={isLoadingRegions || isFetchingRegions}
        renderInput={(params) => (
          <TextField {...params} size={"small"} label="Select Region" />
        )}
      />
    );
  };

  // areas
  const [getAreas, { isLoading: isLoadingAreas, isFetching: isFetchingAreas }] =
    useLazyGetUnpaginatedAreasQuery();

  const handleOpenAreas = async () => {
    setIsOpenAreas(true);
    try {
      const response: UnpaginatedApiResponse<IAreaResponse> = await getAreas({
        status: "active",
      }).unwrap();
      const areas = response.data;
      setAreas(areas);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 422) {
        enqueueSnackbar(apiError.detail, { variant: "error" });
      } else {
        enqueueSnackbar("An unexpected error has occured", {
          variant: "error",
        });
      }
    }
  };

  const handleCloseAreas = () => {
    setIsOpenAreas(false);
  };

  const renderAreas = () => {
    return (
      <Autocomplete
        sx={{ width: "150px" }}
        slotProps={{
          listbox: {
            style: { maxHeight: "200px" },
          },
        }}
        fullWidth
        options={areas ?? []}
        onOpen={handleOpenAreas}
        onClose={handleCloseAreas}
        open={isOpenAreas}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(_, value) => setArea(value)}
        getOptionLabel={(option) => option.name}
        value={area}
        loading={isLoadingAreas || isFetchingAreas}
        renderInput={(params) => (
          <TextField {...params} size={"small"} label="Select Area" />
        )}
      />
    );
  };

  return (
    <MasterlistLayout
      headerProps={{
        icon: (
          <PhosphorIcon
            icon={MODULES.QA.ICON_ON}
            color="var(--primary-main)"
            size={24}
          />
        ),
        title: MODULES.QA.ALIAS,
        rightContent: (
          <Box>
            <Grid container spacing={1} size={12}>
              <Grid>
                <MonthYearFilter date={date} setDate={setDate} />
              </Grid>
              <Grid>{renderRegions()}</Grid>
              <Grid>{renderAreas()}</Grid>
            </Grid>
          </Box>
        ),
      }}
    >
      <TableComponent<IQADashboardResponse>
        columns={columns}
        isError={isError}
        data={transformedData ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        expandedRows={expandedRows ?? {}}
        onExpandedRowsChange={setExpandedRows}
        rightClickMenuItems={getRightClickMenuItems}
        actions={getRightClickMenuItems}
        pagination={pagination}
      />
    </MasterlistLayout>
  );
};

export default QADashboard;
