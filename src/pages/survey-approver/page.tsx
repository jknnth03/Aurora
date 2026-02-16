import { FrameCorners } from "@phosphor-icons/react";
import MasterlistLayout from "../../components/layout/masterlist-layout/masterlist-layout";
import { MODULES } from "../../config/modules/modules";
import { PhosphorIcon } from "../../hooks/usePhosphorIcon";
import TableComponent, { ITableColumn } from "../../components/ui/table/table";
import { useMemo, useState } from "react";
import { useTablePagination } from "../../hooks/useTablePagination";
import { ContextMenuItem } from "../../components/ui/context-menu/context-menu";
import { enqueueSnackbar } from "notistack";
import StatusChip from "../qa-dashboard/components/status-chip.tsx";
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
import {
  getData,
  getChecklistData,
} from "../../features/slices/qaDashboard-slice.ts";
import { useDispatch } from "react-redux";
import moment from "moment";
import { useGetSurveyApproversQuery } from "../../features/api/aurora/survey-approver.api.ts";
import { SurveyApproversResponse } from "../../features/api/aurora/types/survey-approver-types.ts";
import {
  ApiError,
  UnpaginatedApiResponse,
} from "../../features/api/aurora/types/types.ts";

const SurveyApprover = () => {
  const [isOpenRegions, setIsOpenRegions] = useState(false);
  const [regions, setRegions] = useState<IRegionResponse[] | null>(null);
  const [region, setRegion] = useState<IRegionResponse | null>(null);
  const [isOpenAreas, setIsOpenAreas] = useState(false);
  const [areas, setAreas] = useState<IAreaResponse[] | null>(null);
  const [area, setArea] = useState<IAreaResponse | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>();
  const dispatch = useDispatch();
  const { open: openQAChecklistDialog } = useOpenChecklist();

  const { pagination } = useTablePagination({
    defaultRowsPerPage: 25,
    totalCount: 0,
    isZeroBased: false,
  });

  const {
    data: surveyApprovers,
    isLoading,
    isFetching,
    isError,
  } = useGetSurveyApproversQuery({
    status: "pending",
  });

  if (
    surveyApprovers?.data.total !== undefined &&
    pagination.count !== surveyApprovers.data.total
  ) {
    pagination.count = surveyApprovers.data.total;
  }

  const getWeekOrdinal = (week: number): string => {
    const ordinals = ["1st", "2nd", "3rd", "4th"];
    return week >= 1 && week <= 4
      ? `${ordinals[week - 1]} week`
      : `${week}th week`;
  };

  const columns: Array<
    ITableColumn<Partial<SurveyApproversResponse>, unknown>
  > = [
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
      id: "week",
      label: "Week",
      getValue: (qaItem) => {
        const weekRecord = qaItem?.store_checklist?.[0]?.weekly_record?.[0];
        const week = weekRecord?.week;
        return week ? getWeekOrdinal(week) : "-";
      },
      sortable: true,
    },
    {
      id: "checklist_date",
      label: "Checklist Date",
      getValue: (qaItem) => {
        const weekRecord = qaItem?.store_checklist?.[0]?.weekly_record?.[0];
        const month = weekRecord?.month;
        const year = weekRecord?.year;

        if (!month || !year) return "-";

        return moment()
          .month(month - 1)
          .year(year)
          .format("MMMM YYYY");
      },
      sortable: true,
    },
    {
      id: "status",
      label: "Status",
      getValue: () => {},
      renderCell: (value, item) => {
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
            (record) => record.status === "Completed",
          );
        const hasApproval = item?.store_checklist?.[0]?.weekly_record?.some(
          (record) => record.status === "For Approval",
        );
        const weekStoreAreSomeOverdue =
          item?.store_checklist?.[0]?.weekly_record?.some(
            (record) => record.status === "Overdue",
          );
        const weekStore = item?.store_checklist?.[0]?.weekly_record;
        const isComplete =
          weekStore?.length == mondayCount && weekStoreAreAllCompleted;
        const isRejected =
          item?.store_checklist?.some(
            (record) =>
              record.weekly_record.find(
                (record) => record.status === "Rejected",
              ) !== undefined,
          ) || false;
        let status;
        status = isRejected ? "Rejected" : isComplete ? "Done" : "Pending";
        if (weekStoreAreSomeOverdue) status = "Overdue";
        if (hasApproval) status = "For Approval";
        return <StatusChip status={status} key={item.id} />;
      },
      width: 150,
    },
  ];

  const getRightClickMenuItems = (
    qaItem: SurveyApproversResponse,
  ): Array<ContextMenuItem<SurveyApproversResponse>> => {
    const itemMonth = qaItem?.store_checklist?.[0]?.weekly_record?.[0]?.month;
    const itemYear = qaItem?.store_checklist?.[0]?.weekly_record?.[0]?.year;
    const itemWeek = qaItem?.store_checklist?.[0]?.weekly_record?.[0]?.week;
    const itemStatus = qaItem?.store_checklist?.[0]?.weekly_record?.[0]?.status;

    return [
      {
        id: `view-${qaItem.id}`,
        label: "View Data",
        icon: <FrameCorners />,
        onClick: () => {
          dispatch(
            getData({
              touchedData: {
                ...qaItem,
                month: itemMonth,
                year: itemYear,
                isViewing: true,
              },
            }),
          );

          const checklistPayload = {
            isForApproving: true,
            week: itemWeek?.toString() || "",
            month: itemMonth?.toString() || "",
            year: itemYear?.toString() || "",
            status: itemStatus || "",
          };

          dispatch(
            getChecklistData({
              checklistData: checklistPayload,
            }),
          );

          openQAChecklistDialog(MODULES.SURVEY_APPROVER.ALIAS, qaItem.id);
        },
      },
    ];
  };

  const transformedData = useMemo<SurveyApproversResponse[]>(() => {
    const rows = surveyApprovers?.data.data;
    let finalData = rows;

    if (region) {
      finalData = finalData?.filter((item) => item.region?.id === region.id);
    }

    if (area) {
      finalData = finalData?.filter((item) => item.area?.id === area.id);
    }

    return finalData || [];
  }, [surveyApprovers?.data.data, region, area]);

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
            icon={MODULES.SURVEY_APPROVER.ICON_ON}
            color="var(--primary-main)"
            size={24}
          />
        ),
        title: MODULES.SURVEY_APPROVER.ALIAS,
        rightContent: (
          <Box>
            <Grid container spacing={1} size={12}>
              <Grid>{renderRegions()}</Grid>
              <Grid>{renderAreas()}</Grid>
            </Grid>
          </Box>
        ),
      }}>
      <TableComponent<SurveyApproversResponse>
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

export default SurveyApprover;
