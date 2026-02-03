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

const Store = () => {
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
    data: stores,
    isLoading,
    isFetching,
    isError,
  } = useGetStoresQuery({
    search: currentParams?.q,
    page: paginationParams.page,
    per_page: paginationParams.per_page,
    status: showInactive ? "inactive" : "active",
  });
  const [archiveStore] = useArchiveStoreMutation();
  // Update total count when data is loaded
  if (
    stores?.data.total !== undefined &&
    pagination.count !== stores.data.total
  ) {
    pagination.count = stores.data.total;
  }

  // Define strongly-typed columns for the UserResult data
  const columns: Array<ITableColumn<Partial<IStoreResponse>, unknown>> = [
    {
      id: "idnumber",
      label: "ID",
      getValue: (store) => store.id,
      sortable: true,
    },
    {
      id: "store_name",
      label: "Store Name",
      getValue: (store) => store.name,
      sortable: true,
    },
  ];

  const getRightClickMenuItems = (
    store: IStoreResponse
  ): Array<ContextMenuItem<IStoreResponse>> => [
    {
      id: `edit-${store.id}`,
      label: "Edit Store",
      icon: <Pencil />,
      onClick: () =>
        openUpdate(MODULES.MASTERLIST.CHILDREN.STORE.ALIAS, store.id),
    },
    {
      id: `archive-${store.id}`,
      label: showInactive ? "Restore Store" : "Archive Store",
      icon: showInactive ? <TrayArrowUp /> : <Trash />,
      onClick: async (store) => {
        try {
          const response = await confirm({
            title: showInactive ? `Restore Store` : `Archive Store`,
            yesText: "Yes",
            noText: "No",
            description: showInactive
              ? `Do you want to restore this store: ${store.name}`
              : `Do you want to archive this store: ${store.name}`,
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
    openCreate(MODULES.MASTERLIST.CHILDREN.STORE.ALIAS);
  };

  return (
    <MasterlistLayout
      headerProps={{
        icon: (
          <PhosphorIcon
            icon={MODULES.MASTERLIST.CHILDREN.STORE.ICON_ON}
            color="var(--primary-main)"
            size={24}
          />
        ),
        title: MODULES.MASTERLIST.CHILDREN.STORE.ALIAS,
        leftContent: (
          <>
            <CoolTip title="Create Store">
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
      <TableComponent<IStoreResponse>
        columns={columns}
        isError={isError}
        data={stores?.data.data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        expandedRows={expandedRows ?? {}}
        onExpandedRowsChange={setExpandedRows}
        // collapseValue={(store) => {
        //   return <ExpandedContent store={store} />;
        // }}
        rightClickMenuItems={getRightClickMenuItems}
        actions={getRightClickMenuItems}
        pagination={pagination}
      />
    </MasterlistLayout>
  );
};

export default Store;
