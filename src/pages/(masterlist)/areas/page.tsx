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
  IRegionResponse,
  useArchiveRegionMutation,
} from "../../../features/api/aurora/masterlist/regions.api";
import {
  IAreaResponse,
  useArchiveAreaMutation,
  useGetAreasQuery,
} from "../../../features/api/aurora/masterlist/areas.api";

const Areas = () => {
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
    data: areas,
    isLoading,
    isFetching,
    isError,
  } = useGetAreasQuery({
    search: currentParams?.q,
    page: paginationParams.page,
    per_page: paginationParams.per_page,
    status: showInactive ? "inactive" : "active",
  });
  const [archiveArea] = useArchiveAreaMutation();
  // Update total count when data is loaded
  if (
    areas?.data.total !== undefined &&
    pagination.count !== areas.data.total
  ) {
    pagination.count = areas.data.total;
  }

  // Define strongly-typed columns for the UserResult data
  const columns: Array<ITableColumn<Partial<IAreaResponse>, unknown>> = [
    {
      id: "idnumber",
      label: "ID No",
      getValue: (area) => `${area.id}`,
      sortable: true,
    },
    {
      id: "region",
      label: "Region",
      getValue: (area) => area.region?.name,
      sortable: true,
    },

    {
      id: "area",
      label: "Area",
      getValue: (area) => area.name,
      // renderCell: (value) => value,
      sortable: true,
    },
    {
      id: "area_head",
      label: "Area Head",
      getValue: (area) => area.area_head?.full_name,
    },
    {
      id: "status",
      label: "Status",
      getValue: (area) => {},
      renderCell: (value, item) => (
        <ArchiveChip archived={showInactive ?? false} key={item.id} />
      ),
      width: 150,
    },
  ];

  // Right-click menu items
  const getRightClickMenuItems = (
    area: IAreaResponse
  ): Array<ContextMenuItem<IAreaResponse>> => [
    {
      id: `edit-${area.id}`,
      label: "Edit Area",
      icon: <Pencil />,
      onClick: () =>
        openUpdate(MODULES.MASTERLIST.CHILDREN.AREA.ALIAS, area.id),
    },
    {
      id: `archive-${area.id}`,
      label: showInactive ? "Restore Area" : "Archive Area",
      icon: showInactive ? <TrayArrowUp /> : <Trash />,
      onClick: async () => {
        try {
          const response = await confirm({
            title: showInactive ? `Restore Area` : `Archive Area`,
            yesText: "Yes",
            noText: "No",
            description: showInactive
              ? `Do you want to restore this user: ${area.name}`
              : `Do you want to archive this user: ${area.name}`,
            callback: () => archiveArea(area.id),
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
    openCreate(MODULES.MASTERLIST.CHILDREN.AREA.ALIAS);
  };

  return (
    <MasterlistLayout
      headerProps={{
        icon: (
          <PhosphorIcon
            icon={MODULES.MASTERLIST.CHILDREN.AREA.ICON_ON}
            color="var(--primary-main)"
            size={24}
          />
        ),
        title: MODULES.MASTERLIST.CHILDREN.AREA.ALIAS,
        leftContent: (
          <>
            <CoolTip title="Create User">
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
      <TableComponent<IAreaResponse>
        columns={columns}
        isError={isError}
        data={areas?.data.data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        expandedRows={expandedRows ?? {}}
        onExpandedRowsChange={setExpandedRows}
        // collapseValue={(area) => {
        //   // return <ExpandedContent area={area} />;
        // }}
        rightClickMenuItems={getRightClickMenuItems}
        actions={getRightClickMenuItems}
        pagination={pagination}
      />
    </MasterlistLayout>
  );
};

export default Areas;
