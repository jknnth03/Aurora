import { FirstAid, Pencil, Trash, TrayArrowUp } from "@phosphor-icons/react";
import moment from "moment";
import { useState } from "react";
import MasterlistLayout from "../../../components/layout/masterlist-layout/masterlist-layout";
import CoolTip from "../../../components/ui/cool-tip/cool-tip";
import SmartButton from "../../../components/ui/smart-button/smart-button";
import TableComponent, {
  ITableColumn,
} from "../../../components/ui/table/table";
import { CONFIG } from "../../../config/config";
import { MODULES } from "../../../config/modules/modules";
import {
  Role,
  useArchiveRoleMutation,
  useGetRolesQuery,
} from "../../../features/api/aurora/masterlist/role.api";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import { useOpenUpdate } from "../../../hooks/useOpenUpdate";
import { PhosphorIcon } from "../../../hooks/usePhosphorIcon";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import { useTablePagination } from "../../../hooks/useTablePagination";
import ExpandedContent from "./table-expand-content";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import ArchiveChip from "../components/archive-chip";
import useConfirm from "../../../components/ui/confirm-box/hooks/useConfirm";
import { useSnackbar } from "notistack";
import { ApiError } from "../../../features/api/aurora/types/types";

const Roles = () => {
  // State for expanded rows
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>();
  const { currentParams, setQueryParams } = useRememberQueryParams();

  const { open: openUpdate } = useOpenUpdate();
  const { open: openCreate } = useOpenCreate();

  const showInactive = currentParams?.status === "inactive";

  // Use the pagination hook
  const { pagination, paginationParams } = useTablePagination({
    defaultRowsPerPage: 25,
    totalCount: 0, // Will be updated when data is loaded
  });

  const {
    data: roles,
    isLoading,
    isFetching,
    isError,
  } = useGetRolesQuery({
    search: currentParams?.q,
    page: paginationParams.page,
    per_page: paginationParams.per_page,
    status: showInactive ? "inactive" : "active",
  });

  const handleShowArchivedChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setQueryParams(
      {
        status: event.target.checked ? "inactive" : "active",
      },
      { retain: true }
    );
  };

  // Update total count when data is loaded
  if (
    roles?.data.total !== undefined &&
    pagination.count !== roles.data.total
  ) {
    pagination.count = roles.data.total;
  }

  // Define strongly-typed columns for the UserResult data
  const columns: Array<ITableColumn<Partial<Role>, unknown>> = [
    {
      id: "id",
      label: "ID",
      getValue: (role) => role.id,
      sortable: true,
      width: 80,
    },
    {
      id: "name",
      label: "Name",
      getValue: (role) => role.name,
      sortable: true,
      width: 80,
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
      id: "updated_at",
      label: "Last Updated",
      getValue: (role) =>
        moment(role.updated_at).format(CONFIG.DATE_FORMAT_DISPLAY),
      sortable: true,
      width: 120,
    },
  ];
  const [archiveRole] = useArchiveRoleMutation();
  // Right-click menu items
  const getRightClickMenuItems = (role: Role) => [
    {
      id: `edit-${role.id}`,
      label: "Edit Role",
      icon: <Pencil />,
      onClick: () =>
        openUpdate(MODULES.MASTERLIST.CHILDREN.ROLES.ALIAS, role.id),
    },
    {
      id: `archive-${role.id}`,
      label: showInactive ? "Restore Role" : "Archive Role",
      icon: showInactive ? <TrayArrowUp /> : <Trash />,
      onClick: async () => {
        try {
          const response = await confirm({
            title: showInactive ? `Restore Role` : `Archive Role`,
            yesText: "Yes",
            noText: "No",
            description: showInactive
              ? `Do you want to restore this role: ${role.name}`
              : `Do you want to archive this role: ${role.name}`,
            callback: () => archiveRole(role.id.toString()),
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

  return (
    <MasterlistLayout
      headerProps={{
        icon: (
          <PhosphorIcon
            icon={MODULES.MASTERLIST.CHILDREN.ROLES.ICON_ON}
            size={24}
            color="var(--primary-main)"
            style={{ textAlign: "center", justifySelf: "center" }}
          />
        ),
        title: MODULES.MASTERLIST.CHILDREN.ROLES.ALIAS,
        rightContent: (
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={showInactive}
                onChange={handleShowArchivedChange}
                color="primary"
              />
            }
            label="Archived"
          />
        ),
        leftContent: (
          <>
            <CoolTip title="Create Role">
              <SmartButton
                shortcut={CONFIG.SHORTCUTS.CREATE}
                variant="contained"
                startIcon={<FirstAid color="var(--primary-contrastText)" />}
                onClick={() =>
                  openCreate(MODULES.MASTERLIST.CHILDREN.ROLES.ALIAS)
                }
              >
                Create
              </SmartButton>
            </CoolTip>
          </>
        ),
      }}
    >
      <TableComponent<Role>
        columns={columns}
        isError={isError}
        data={roles?.data.data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        expandedRows={expandedRows ?? {}}
        onExpandedRowsChange={setExpandedRows}
        collapseValue={(role) => <ExpandedContent role={role} />}
        rightClickMenuItems={getRightClickMenuItems}
        actions={getRightClickMenuItems}
        pagination={pagination}
      />
    </MasterlistLayout>
  );
};

export default Roles;
