import {
  Eye,
  FirstAid,
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
  IChecklistResponse,
  useArchiveChecklistMutation,
  useLazyGetChecklistQuery,
} from "../../../features/api/aurora/masterlist/checklist.api";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import { useOpenUpdate } from "../../../hooks/useOpenUpdate";
import { PhosphorIcon } from "../../../hooks/usePhosphorIcon";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import { useTablePagination } from "../../../hooks/useTablePagination";
import ExpandedContent from "./table-expand-content";
import { enqueueSnackbar } from "notistack";
import { ApiError } from "../../../features/api/aurora/types/types";
import useConfirm from "../../../components/ui/confirm-box/hooks/useConfirm";
import ArchiveChip from "../components/archive-chip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useGetChecklistsQuery } from "../../../features/api/aurora/masterlist/checklist.api";
import Box from "@mui/material/Box";
import { useOpenChecklist } from "../../../hooks/useOpenChecklist";

const Checklists = () => {
  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>();
  const { currentParams, setQueryParams } = useRememberQueryParams();

  const showInactive = currentParams?.status === "inactive";
  const { open: openUpdate } = useOpenUpdate();
  const { open: openCreate } = useOpenCreate();
  const { open: openChecklist } = useOpenChecklist();
  const confirm = useConfirm();

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

  // Use the pagination hook
  const { pagination, paginationParams } = useTablePagination({
    defaultRowsPerPage: 25,
    totalCount: 0,
    isZeroBased: false,
  });
  const {
    data: checklists,
    isLoading,
    isFetching,
    isError,
  } = useGetChecklistsQuery({
    search: currentParams?.q,
    page: paginationParams.page,
    per_page: paginationParams.per_page,
    status: showInactive ? "inactive" : "active",
  });

  const [archiveChecklist] = useArchiveChecklistMutation();
  // Update total count when data is loaded
  if (
    checklists?.data.total !== undefined &&
    pagination.count !== checklists.data.total
  ) {
    pagination.count = checklists.data.total;
  }

  const [viewChecklist, { isLoading: isChecklistLoading }] =
    useLazyGetChecklistQuery();

  const handleViewUserChecklist = (id: number | undefined) => {
    if (id !== undefined)
      openChecklist(MODULES.MASTERLIST.CHILDREN.CHECKLIST.ALIAS + "-user", id);
  };

  const columns: Array<ITableColumn<Partial<IChecklistResponse>, unknown>> = [
    {
      id: "idnumber",
      label: "ID No",
      getValue: (checklist) => `${checklist.id}`,
      sortable: true,
    },
    {
      id: "checklistname",
      label: "Checklist Name",
      getValue: (checklist) => `${checklist.name}`,
      sortable: true,
    },
    {
      id: "status",
      label: "Status",
      getValue: (checklist) => {},
      renderCell: (value, item) => (
        <ArchiveChip archived={showInactive ?? false} key={item.id} />
      ),
      width: 150,
    },
    {
      id: "view",
      label: "View",
      getValue: (checklist) => {},
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
              display: "flex",
              alignItems: "center",
              justifyContent: "start",
              height: "100%",
              width: "min-content",
              ":hover": { backgroundColor: "#e5ff0077" },
              borderRadius: "100%",
            }}
          >
            <Eye
              color="orange"
              size={20}
              onClick={() => {
                handleViewUserChecklist(item?.id);
              }}
              weight="fill"
            />
          </Box>
        </Box>
      ),
      width: 150,
    },
    {
      id: "created_at",
      label: "Date Created",
      getValue: (checklist) =>
        moment(checklist.created_at).format(CONFIG.DATE_FORMAT_DISPLAY),
      sortable: true,
    },
  ];

  // Right-click menu items
  const getRightClickMenuItems = (
    checklist: IChecklistResponse
  ): Array<ContextMenuItem<IChecklistResponse>> => [
    {
      id: `edit-${checklist.id}`,
      label: "Edit Checklist",
      icon: <Pencil />,
      onClick: () =>
        openUpdate(MODULES.MASTERLIST.CHILDREN.CHECKLIST.ALIAS, checklist.id),
    },
    {
      id: `archive-${checklist.id}`,
      label: showInactive ? "Restore Checklist" : "Archive Checklist",
      icon: showInactive ? <TrayArrowUp /> : <Trash />,
      onClick: async () => {
        try {
          const response = await confirm({
            title: showInactive ? `Restore Checklist` : `Archive Checklist`,
            yesText: "Yes",
            noText: "No",
            description: showInactive
              ? `Do you want to restore this checklist: ${checklist.name}`
              : `Do you want to archive this checklist: ${checklist.name}`,
            callback: () => archiveChecklist(checklist.id),
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
    openCreate(MODULES.MASTERLIST.CHILDREN.CHECKLIST.ALIAS);
  };

  return (
    <MasterlistLayout
      headerProps={{
        icon: (
          <PhosphorIcon
            icon={MODULES.MASTERLIST.CHILDREN.CHECKLIST.ICON_ON}
            color="var(--primary-main)"
            size={24}
          />
        ),
        title: MODULES.MASTERLIST.CHILDREN.CHECKLIST.ALIAS,
        leftContent: (
          <>
            <CoolTip title="Create Checklist">
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
      <TableComponent<IChecklistResponse>
        columns={columns}
        isError={isError}
        data={checklists?.data.data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        expandedRows={expandedRows ?? {}}
        onExpandedRowsChange={setExpandedRows}
        collapseValue={(checklist) => {
          return <ExpandedContent checklist={checklist} />;
        }}
        rightClickMenuItems={getRightClickMenuItems}
        actions={getRightClickMenuItems}
        pagination={pagination}
      />
    </MasterlistLayout>
  );
};

export default Checklists;
