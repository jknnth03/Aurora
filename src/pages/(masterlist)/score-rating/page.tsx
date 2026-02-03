import { FirstAid, Pencil, Trash, TrayArrowUp } from "@phosphor-icons/react";
import moment from "moment";
import { useState } from "react";
import MasterlistLayout from "../../../components/layout/masterlist-layout/masterlist-layout";
import { ContextMenuItem } from "../../../components/ui/context-menu/context-menu";
import CoolTip from "../../../components/ui/cool-tip/cool-tip";
import SmartButton from "../../../components/ui/smart-button/smart-button";
import TableComponent, {
  ITableColumn,
} from "../../../components/ui/table/table";
import { CONFIG } from "../../../config/config";
import { MODULES } from "../../../config/modules/modules";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import { useOpenUpdate } from "../../../hooks/useOpenUpdate";
import { PhosphorIcon } from "../../../hooks/usePhosphorIcon";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import { useTablePagination } from "../../../hooks/useTablePagination";
import ExpandedContent from "./table-expand-content";
import { enqueueSnackbar } from "notistack";
import {
  ApiError,
  ApiErrorResponse,
  isApiErrorResponse,
} from "../../../features/api/aurora/types/types";
import useConfirm from "../../../components/ui/confirm-box/hooks/useConfirm";
import ArchiveChip from "../components/archive-chip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import {
  IScoreRatingResponse,
  useArchiveScoreRatingMutation,
  useGetScoreRatingsQuery,
} from "../../../features/api/aurora/masterlist/score-rating.api";

const ScoreRatings = () => {
  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>();
  const { currentParams, setQueryParams } = useRememberQueryParams();

  const showInactive = currentParams?.status === "inactive";
  const { open: openUpdate } = useOpenUpdate();
  const { open: openCreate } = useOpenCreate();

  const handleShowActiveChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setQueryParams(
      {
        status: showInactive ? "active" : "inactive",
      },
      { retain: true }
    );
  };

  const confirm = useConfirm();

  // Use the pagination hook
  const { pagination, paginationParams } = useTablePagination({
    defaultRowsPerPage: 25,
    totalCount: 0,
    isZeroBased: false,
  });
  const {
    data: scoreRatings,
    isLoading,
    isFetching,
    isError,
  } = useGetScoreRatingsQuery({
    search: currentParams?.q,
    page: paginationParams.page,
    per_page: paginationParams.per_page,
    status: showInactive ? "inactive" : "active",
  });
  const [archiveScoreRating] = useArchiveScoreRatingMutation();
  const exceededScoreRatings = scoreRatings?.data?.data?.length
    ? scoreRatings?.data?.data?.length > 3
    : false;
  // Update total count when data is loaded
  if (
    scoreRatings?.data.total !== undefined &&
    pagination.count !== scoreRatings.data.total
  ) {
    pagination.count = scoreRatings.data.total;
  }

  // Define strongly-typed columns for the UserResult data
  const columns: Array<ITableColumn<Partial<IScoreRatingResponse>, unknown>> = [
    {
      id: "idnumber",
      label: "ID No",
      getValue: (scoreRating) => `${scoreRating.id}`,
      sortable: true,
    },
    {
      id: "rating",
      label: "Rating",
      getValue: (scoreRating) => scoreRating.rating,
      sortable: true,
    },

    {
      id: "score",
      label: "Score",
      getValue: (scoreRating) => scoreRating.score,
      // renderCell: (value) => value,
      sortable: true,
    },
    {
      id: "status",
      label: "Status",
      getValue: (scoreRating) => {},
      renderCell: (value, item) => (
        <ArchiveChip archived={showInactive ?? false} key={item.id} />
      ),
      width: 150,
    },

    {
      id: "created_at",
      label: "Date Created",
      getValue: (scoreRating) =>
        moment(scoreRating.created_at).format(CONFIG.DATE_FORMAT_DISPLAY),
      sortable: true,
    },
  ];

  // Right-click menu items
  const getRightClickMenuItems = (
    scoreRating: IScoreRatingResponse
  ): Array<ContextMenuItem<IScoreRatingResponse>> => [
    {
      id: `edit-${scoreRating.id}`,
      label: "Edit Score Rating",
      icon: <Pencil />,
      onClick: () =>
        openUpdate(
          MODULES.MASTERLIST.CHILDREN.SCORE_RATING.ALIAS,
          scoreRating.id
        ),
    },
    {
      id: `archive-${scoreRating.id}`,
      label: showInactive ? "Restore Score Rating" : "Archive Score Rating",
      icon: showInactive ? <TrayArrowUp /> : <Trash />,
      onClick: async () => {
        try {
          const response = await confirm({
            title: showInactive
              ? `Restore Score Rating`
              : `Archive Score Rating`,
            yesText: "Yes",
            noText: "No",
            description: showInactive
              ? `Do you want to restore this score rating: ${scoreRating.id}: Rating-Score: ${scoreRating.rating} - ${scoreRating.score}`
              : `Do you want to archive this score rating: ${scoreRating.id}: Rating-Score: ${scoreRating.rating} - ${scoreRating.score}`,
            callback: () => archiveScoreRating(scoreRating.id),
          });

          if (response.isConfirmed) {
            enqueueSnackbar(response.result?.data?.message, {
              variant: "success",
            });
          }
        } catch (error) {
          const apiError = error as ApiError;
          if (apiError.status === 422) {
            enqueueSnackbar(apiError?.title, {
              variant: "error",
            });
          } else {
            enqueueSnackbar("An unexpected error occurred.", {
              variant: "error",
            });
          }
        }
      },
    },
  ];

  const handleOpenCreateDialog = () => {
    if (exceededScoreRatings) {
      enqueueSnackbar("Score Ratings are already three.", { variant: "error" });
      return;
    }
    openCreate(MODULES.MASTERLIST.CHILDREN.SCORE_RATING.ALIAS);
  };

  return (
    <MasterlistLayout
      headerProps={{
        icon: (
          <PhosphorIcon
            icon={MODULES.MASTERLIST.CHILDREN.SCORE_RATING.ICON_ON}
            color="var(--primary-main)"
            size={24}
          />
        ),
        title: MODULES.MASTERLIST.CHILDREN.SCORE_RATING.ALIAS,
        leftContent: (
          <>
            <CoolTip title="Create Score Rating">
              <SmartButton
                shortcut={CONFIG.SHORTCUTS.CREATE}
                variant="contained"
                startIcon={<FirstAid color="var(--primary-contrastText)" />}
                onClick={handleOpenCreateDialog}
              >
                Create
              </SmartButton>
            </CoolTip>
          </>
        ),
        rightContent: (
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={showInactive}
                onChange={handleShowActiveChange}
                color="primary"
              />
            }
            label="Inactive"
          />
        ),
      }}
    >
      <TableComponent<IScoreRatingResponse>
        columns={columns}
        isError={isError}
        data={scoreRatings?.data.data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        expandedRows={expandedRows ?? {}}
        onExpandedRowsChange={setExpandedRows}
        // collapseValue={(scoreRating) => {
        //   return <ExpandedContent scoreRating={scoreRating} />;
        // }}
        rightClickMenuItems={getRightClickMenuItems}
        actions={getRightClickMenuItems}
        pagination={pagination}
      />
    </MasterlistLayout>
  );
};

export default ScoreRatings;
