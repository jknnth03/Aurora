import { ArrowsClockwise } from "@phosphor-icons/react";
import moment from "moment";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import MasterlistLayout from "../../../components/layout/masterlist-layout/masterlist-layout";
import CoolTip from "../../../components/ui/cool-tip/cool-tip";
import TableComponent, {
  ITableColumn,
} from "../../../components/ui/table/table";
import { CONFIG } from "../../../config/config";
import { MODULES } from "../../../config/modules/modules";
import type { IOneCharging as OneCharging } from "../../../features/api/aurora/masterlist/one-charging.api";
import {
  useGetOneChargingsQuery,
  useSyncOneChargingMutation,
} from "../../../features/api/aurora/masterlist/one-charging.api";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import { useTablePagination } from "../../../hooks/useTablePagination";
import ExpandedContent from "./table-expand-content";
import { PhosphorIcon } from "../../../hooks/usePhosphorIcon";
import SmartButton from "../../../components/ui/smart-button/smart-button";
import {
  ApiErrorResponse,
  isApiErrorResponse,
} from "../../../features/api/aurora/types/types";
import ArchiveChip from "../components/archive-chip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

const OneCharging = () => {
  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>();

  const { currentParams, setQueryParams } = useRememberQueryParams();
  const showInactive = currentParams?.status === "inactive";

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

  const [syncOneCharging, { isLoading: isSyncLoading, isError: isSyncError }] =
    useSyncOneChargingMutation();

  // Use the pagination hook
  const { pagination, paginationParams } = useTablePagination({
    defaultRowsPerPage: 25,
    totalCount: 0, // Will be updated when data is loaded
  });

  const {
    data: chargings,
    isLoading,
    isFetching,
    isError,
  } = useGetOneChargingsQuery({
    search: currentParams?.q,
    page: paginationParams.page,
    per_page: paginationParams.per_page,
    status: showInactive ? "inactive" : "active",
  });
  // Update total count when data is loaded
  if (
    chargings?.data.total !== undefined &&
    pagination.count !== chargings.data.total
  ) {
    pagination.count = chargings.data.total;
  }

  // Define strongly-typed columns for the UserResult data
  const columns: Array<ITableColumn<Partial<OneCharging>, unknown>> = [
    {
      id: "code",
      label: "Code",
      getValue: (charging) => charging.code,
      sortable: true,
      width: 150,
    },
    {
      id: "name",
      label: "Charging",
      getValue: (charging) => charging.name,
      sortable: true,
    },

    {
      id: "status",
      label: "Status",
      getValue: (charging) => {},
      renderCell: (value, item) => (
        <ArchiveChip archived={showInactive ?? false} key={item.id} />
      ),
      width: 150,
    },
    {
      id: "updated",
      label: "Last Updated",
      getValue: (charging) =>
        moment(charging.updated_at).format(CONFIG.DATE_FORMAT_DISPLAY),

      sortable: true,
    },
  ];

  // Right-click menu items
  // const getRightClickMenuItems = (charging: OneCharging) => [
  // 	{
  // 		id: `edit-${charging.id}`,
  // 		label: "Edit Role",
  // 		icon: <Pencil />,
  // 		onClick: () => openUpdate(MODULES.MASTERLIST.CHILDREN.ROLES.ALIAS, charging.id),
  // 	},
  // 	{
  // 		id: `archive-${charging.id}`,
  // 		label: "Archive Role",
  // 		icon: <Trash />,
  // 		onClick: () => console.log("Delete Role:", charging.id),
  // 	},
  // ];

  const handleSync = async () => {
    try {
      const res = await syncOneCharging({}).unwrap();

      enqueueSnackbar(res.message, { variant: "success" });
    } catch (error) {
      if (isApiErrorResponse(error)) {
        error?.data.errors.forEach((err) => {
          enqueueSnackbar(err.detail, { variant: "error" });
        });
      }
    }
  };
  const leftContent = (
    <>
      <CoolTip title="Sync One Charging">
        <SmartButton
          shortcut={CONFIG.SHORTCUTS.CREATE}
          variant="contained"
          startIcon={<ArrowsClockwise color="var(--primary-contrastText)" />}
          onClick={handleSync}
          loading={isSyncLoading}
          loadingPosition="start"
        >
          {isSyncLoading ? "Syncing" : "Sync"}
        </SmartButton>
      </CoolTip>
    </>
  );

  return (
    <MasterlistLayout
      headerProps={{
        icon: (
          <PhosphorIcon
            icon={MODULES.MASTERLIST.CHILDREN.ONE_CHARGING.ICON_ON}
            size={24}
            color="var(--primary-main)"
            style={{
              textAlign: "center",
              justifySelf: "center",
              color: "var(--primary-main)",
            }}
          />
        ),
        title: MODULES.MASTERLIST.CHILDREN.ONE_CHARGING.ALIAS,
        leftContent: leftContent,
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
      <TableComponent<OneCharging>
        columns={columns}
        isError={isError}
        data={chargings?.data.data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        expandedRows={expandedRows ?? {}}
        onExpandedRowsChange={setExpandedRows}
        collapseValue={(charging) => <ExpandedContent charging={charging} />}
        // rightClickMenuItems={getRightClickMenuItems}
        pagination={pagination}
      />
    </MasterlistLayout>
  );
};

export default OneCharging;
