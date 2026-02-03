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
import {
  IUserResponse,
  useArchiveUserMutation,
  useGetUsersQuery,
} from "../../../features/api/aurora/masterlist/user.api";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import { useOpenUpdate } from "../../../hooks/useOpenUpdate";
import { PhosphorIcon } from "../../../hooks/usePhosphorIcon";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import { useTablePagination } from "../../../hooks/useTablePagination";
import { getInitials } from "../../../utils/avatar";
import ExpandedContent from "./table-expand-content";
import { useResetPasswordMutation } from "../../../features/api/aurora/auth/authApi";
import { enqueueSnackbar } from "notistack";
import {
  ApiError,
  isApiErrorResponse,
} from "../../../features/api/aurora/types/types";
import { ApiErrorResponse } from "../../../features/api/aurora/types/types";
import useConfirm from "../../../components/ui/confirm-box/hooks/useConfirm";
import ArchiveChip from "../components/archive-chip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

const Users = () => {
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
    data: users,
    isLoading,
    isFetching,
    isError,
  } = useGetUsersQuery({
    search: currentParams?.q,
    page: paginationParams.page,
    per_page: paginationParams.per_page,
    status: showInactive ? "inactive" : "active",
  });
  const [archiveUser] = useArchiveUserMutation();
  const [resetPassword] = useResetPasswordMutation();
  // Update total count when data is loaded
  if (
    users?.data.total !== undefined &&
    pagination.count !== users.data.total
  ) {
    pagination.count = users.data.total;
  }

  // Define strongly-typed columns for the UserResult data
  const columns: Array<ITableColumn<Partial<IUserResponse>, unknown>> = [
    {
      id: "idnumber",
      label: "ID No",
      getValue: (user) => `${user.id_prefix} - ${user.id_no}`,
      sortable: true,
    },
    {
      id: "full_name",
      label: "Full Name",
      getValue: (user) =>
        `${user.first_name} ${
          user?.middle_name ? getInitials(user?.middle_name ?? "") + "." : ""
        } ${user.last_name}`,
      sortable: true,
    },

    {
      id: "charging",
      label: "Charging",
      getValue: (user) => user?.one_charging?.name,
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
      id: "role",
      label: "Role",
      getValue: (user) => user?.role?.name,
      sortable: true,
    },
    {
      id: "created_at",
      label: "Date Created",
      getValue: (user) =>
        moment(user.created_at).format(CONFIG.DATE_FORMAT_DISPLAY),
      sortable: true,
    },
  ];

  const handleResetPassword = async (id: number) => {
    try {
      const response = await resetPassword(id).unwrap();
      enqueueSnackbar({ message: response.message, variant: "success" });
    } catch (error: ApiErrorResponse | unknown) {
      if (isApiErrorResponse(error))
        error?.data?.errors.forEach((err: ApiError) => {
          enqueueSnackbar({ variant: "error", message: err.detail });
        });
      throw error;
    }
  };
  // Right-click menu items
  const getRightClickMenuItems = (
    user: IUserResponse
  ): Array<ContextMenuItem<IUserResponse>> => [
    {
      id: `edit-${user.id}`,
      label: "Edit User",
      icon: <Pencil />,
      onClick: () =>
        openUpdate(MODULES.MASTERLIST.CHILDREN.USERS.ALIAS, user.id),
    },
    {
      id: `archive-${user.id}`,
      label: showInactive ? "Restore User" : "Archive User",
      icon: showInactive ? <TrayArrowUp /> : <Trash />,
      onClick: async () => {
        try {
          const response = await confirm({
            title: showInactive ? `Restore User` : `Archive User`,
            yesText: "Yes",
            noText: "No",
            description: showInactive
              ? `Do you want to restore this user: ${user.full_name}`
              : `Do you want to archive this user: ${user.full_name}`,
            callback: () => archiveUser(user.id),
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
    {
      id: `reset-password-${user.id}`,
      label: "Reset Password",
      icon: <Key />,
      onClick: (data) => {
        handleResetPassword(data?.id);
      },
    },
  ];

  const handleOpenCreateDialog = () => {
    openCreate(MODULES.MASTERLIST.CHILDREN.USERS.ALIAS);
  };

  return (
    <MasterlistLayout
      headerProps={{
        icon: (
          <PhosphorIcon
            icon={MODULES.MASTERLIST.CHILDREN.USERS.ICON_ON}
            color="var(--primary-main)"
            size={24}
          />
        ),
        title: MODULES.MASTERLIST.CHILDREN.USERS.ALIAS,
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
      <TableComponent<IUserResponse>
        columns={columns}
        isError={isError}
        data={users?.data.data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        expandedRows={expandedRows ?? {}}
        onExpandedRowsChange={setExpandedRows}
        collapseValue={(user) => {
          return <ExpandedContent user={user} />;
        }}
        rightClickMenuItems={getRightClickMenuItems}
        actions={getRightClickMenuItems}
        pagination={pagination}
      />
    </MasterlistLayout>
  );
};

export default Users;
