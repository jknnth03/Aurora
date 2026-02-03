import {
  FirstAid,
  Key,
  Pencil,
  Trash,
  TrayArrowUp,
} from "@phosphor-icons/react";
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
import { ApiError } from "../../../features/api/aurora/types";
import { ApiErrorResponse } from "../../../features/api/aurora/types";
import useConfirm from "../../../components/ui/confirm-box/hooks/useConfirm";
import ArchiveChip from "../components/archive-chip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import {
  IRegionResponse,
  useArchiveRegionMutation,
  useGetRegionsQuery,
} from "../../../features/api/aurora/masterlist/regions.api";

const Regions = () => {
  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>();
  const { currentParams, setQueryParams } = useRememberQueryParams();

  const showInactive = currentParams?.status === "inactive";
  const { open: openUpdate } = useOpenUpdate();
  const { open: openCreate } = useOpenCreate();

  const handleShowActiveChange = () => {
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
    data: regions,
    isLoading,
    isFetching,
    isError,
  } = useGetRegionsQuery({
    search: currentParams?.q,
    page: paginationParams.page,
    per_page: paginationParams.per_page,
    status: showInactive ? "inactive" : "active",
  });
  const [archiveRegion] = useArchiveRegionMutation();
  // Update total count when data is loaded
  if (
    regions?.data.total !== undefined &&
    pagination.count !== regions.data.total
  ) {
    pagination.count = regions.data.total;
  }

  // Define strongly-typed columns for the UserResult data
  const columns: Array<ITableColumn<Partial<IRegionResponse>, unknown>> = [
    {
      id: "idnumber",
      label: "ID No",
      getValue: (region) => `${region.id}`,
      sortable: true,
    },
    {
      id: "region_name",
      label: "Region Name",
      getValue: (region) => region.name,
      sortable: true,
    },

    {
      id: "region_head_name",
      label: "Region Head",
      getValue: (region) => region.region_head?.full_name,
      // renderCell: (value) => value,
      sortable: true,
    },
    {
      id: "status",
      label: "Status",
      getValue: () => {},
      renderCell: (value, item) => (
        <ArchiveChip archived={showInactive ?? false} key={item.id} />
      ),
      width: 150,
    },

    {
      id: "created_at",
      label: "Date Created",
      getValue: (region) =>
        moment(region.created_at).format(CONFIG.DATE_FORMAT_DISPLAY),
      sortable: true,
    },
  ];

  // Right-click menu items
  const getRightClickMenuItems = (
    region: IRegionResponse
  ): Array<ContextMenuItem<IRegionResponse>> => [
    {
      id: `edit-${region.id}`,
      label: "Edit Region",
      icon: <Pencil />,
      onClick: () =>
        openUpdate(MODULES.MASTERLIST.CHILDREN.REGION.ALIAS, region.id),
    },
    {
      id: `archive-${region.id}`,
      label: showInactive ? "Restore Region" : "Archive Region",
      icon: showInactive ? <TrayArrowUp /> : <Trash />,
      onClick: async () => {
        try {
          const response = await confirm({
            title: showInactive ? `Restore Region` : `Archive Region`,
            yesText: "Yes",
            noText: "No",
            description: showInactive
              ? `Do you want to restore this region: ${region.name}`
              : `Do you want to archive this region: ${region.name}`,
            callback: () => archiveRegion(region.id),
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
    openCreate(MODULES.MASTERLIST.CHILDREN.REGION.ALIAS);
  };

  return (
    <MasterlistLayout
      headerProps={{
        icon: (
          <PhosphorIcon
            icon={MODULES.MASTERLIST.CHILDREN.REGION.ICON_ON}
            color="var(--primary-main)"
            size={24}
          />
        ),
        title: MODULES.MASTERLIST.CHILDREN.REGION.ALIAS,
        leftContent: (
          <>
            <CoolTip title="Create Region">
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
      <TableComponent<IRegionResponse>
        columns={columns}
        isError={isError}
        data={regions?.data.data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        expandedRows={expandedRows ?? {}}
        onExpandedRowsChange={setExpandedRows}
        collapseValue={(region) => {
          return <ExpandedContent region={region} />;
        }}
        rightClickMenuItems={getRightClickMenuItems}
        actions={getRightClickMenuItems}
        pagination={pagination}
      />
    </MasterlistLayout>
  );
};

export default Regions;
