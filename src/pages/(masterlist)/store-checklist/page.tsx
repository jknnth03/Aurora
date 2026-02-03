import { FirstAid, Pencil, Trash, TrayArrowUp } from "@phosphor-icons/react";
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
import { enqueueSnackbar } from "notistack";
import { ApiError } from "../../../features/api/aurora/types/types";
import useConfirm from "../../../components/ui/confirm-box/hooks/useConfirm";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import {
  IStoreResponse,
  useArchiveStoreMutation,
  useGetStoresQuery,
} from "../../../features/api/aurora/masterlist/store.api";
import {
  IStoreChecklistResponse,
  useArchiveStoreChecklistMutation,
  useGetStoreChecklistsQuery,
} from "../../../features/api/aurora/masterlist/store-checklist.api";
import { Box } from "@mui/material";
import { Eye } from "@phosphor-icons/react/dist/ssr";
import ExpandedContent from "./table-expand-content";
import { useOpenChecklist } from "../../../hooks/useOpenChecklist";

const StoreChecklist = () => {
  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>();
  const { currentParams, setQueryParams } = useRememberQueryParams();
  const { open: openChecklist } = useOpenChecklist();

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
    data: storeChecklists,
    isLoading,
    isFetching,
    isError,
  } = useGetStoreChecklistsQuery({
    search: currentParams?.q,
    page: paginationParams.page,
    per_page: paginationParams.per_page,
    status: showInactive ? "inactive" : "active",
  });
  const [archiveStore] = useArchiveStoreChecklistMutation();
  // Update total count when data is loaded
  if (
    storeChecklists?.data.total !== undefined &&
    pagination.count !== storeChecklists.data.total
  ) {
    pagination.count = storeChecklists.data.total;
  }

  const handleViewUserChecklist = (id: number | undefined) => {
    if (id !== undefined)
      openChecklist(MODULES.MASTERLIST.CHILDREN.CHECKLIST.ALIAS + "-user", id);
  };

  // Define strongly-typed columns for the UserResult data
  const columns: Array<
    ITableColumn<Partial<IStoreChecklistResponse>, unknown>
  > = [
    {
      id: "idnumber",
      label: "ID",
      getValue: (store) => store.id,
      sortable: true,
    },
    {
      id: "store_id",
      label: "Store ID",
      getValue: (store) => store?.store?.id,
      sortable: true,
    },
    {
      id: "store_name",
      label: "Store Name",
      getValue: (store) => store?.store?.name,
      sortable: true,
    },
    {
      id: "checklist_id",
      label: "Checklist ID",
      getValue: (store) => store.checklist?.id,
      sortable: true,
    },
    {
      id: "checklist",
      label: "Checklist",
      getValue: (store) => store.checklist?.name,
      sortable: true,
    },
    {
      id: "view_checklist",
      label: "View Checklist",
      getValue: (store) => {},
      renderCell: (value, item) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              ":hover": { backgroundColor: "#e5ff0077" },
              height: "21px",
              borderRadius: "100%",
            }}
          >
            <Eye
              color="orange"
              size={20}
              onClick={() => {
                handleViewUserChecklist(item.checklist?.id);
              }}
              weight="fill"
            />
          </Box>
        </Box>
      ),
      width: 150,
    },
  ];

  const getRightClickMenuItems = (
    storeChecklist: IStoreChecklistResponse
  ): Array<ContextMenuItem<IStoreChecklistResponse>> => [
    {
      id: `edit-${storeChecklist.id}`,
      label: "Edit Store",
      icon: <Pencil />,
      onClick: () =>
        openUpdate(
          MODULES.MASTERLIST.CHILDREN.STORE_CHECKLIST.ALIAS,
          storeChecklist.id
        ),
    },
    {
      id: `archive-${storeChecklist.id}`,
      label: showInactive
        ? "Restore Store Checklist"
        : "Archive Store Checklist",
      icon: showInactive ? <TrayArrowUp /> : <Trash />,
      onClick: async (store) => {
        try {
          const response = await confirm({
            title: showInactive
              ? `Restore Store Checklist`
              : `Archive Store Checklist`,
            yesText: "Yes",
            noText: "No",
            description: showInactive
              ? `Do you want to restore this store checklist: ${storeChecklist.store.name}`
              : `Do you want to archive this store checklist: ${storeChecklist.store.name}`,
            callback: () => archiveStore(store.id),
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
    openCreate(MODULES.MASTERLIST.CHILDREN.STORE_CHECKLIST.ALIAS);
  };

  return (
    <MasterlistLayout
      headerProps={{
        icon: (
          <PhosphorIcon
            icon={MODULES.MASTERLIST.CHILDREN.STORE_CHECKLIST.ICON_ON}
            color="var(--primary-main)"
            size={24}
          />
        ),
        title: MODULES.MASTERLIST.CHILDREN.STORE_CHECKLIST.ALIAS,
        leftContent: (
          <>
            <CoolTip title="Create Store Checklist">
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
      <TableComponent<IStoreChecklistResponse>
        columns={columns}
        isError={isError}
        data={storeChecklists?.data.data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        expandedRows={expandedRows ?? {}}
        onExpandedRowsChange={setExpandedRows}
        collapseValue={(storeChecklist) => {
          return (
            <>
              <ExpandedContent storeChecklist={storeChecklist} />
            </>
          );
        }}
        rightClickMenuItems={getRightClickMenuItems}
        actions={getRightClickMenuItems}
        pagination={pagination}
      />
    </MasterlistLayout>
  );
};

export default StoreChecklist;
