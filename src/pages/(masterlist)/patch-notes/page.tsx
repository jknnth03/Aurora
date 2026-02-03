import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import {
  ArrowSquareOut,
  Confetti,
  FileMd,
  FirstAid,
  Pencil,
} from "@phosphor-icons/react";
import moment from "moment";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import MasterlistLayout from "../../../components/layout/masterlist-layout/masterlist-layout";
import CoolTip from "../../../components/ui/cool-tip/cool-tip";
import SmartButton from "../../../components/ui/smart-button/smart-button";
import TableComponent, {
  ITableColumn,
} from "../../../components/ui/table/table";
import { CONFIG } from "../../../config/config";
import { MODULES } from "../../../config/modules/modules";
import {
  IPatchNotesResponse,
  useGetPatchNotesQuery,
  usePublishPatchNoteMutation,
} from "../../../features/api/aurora/masterlist/patch-notes.api";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import { useOpenUpdate } from "../../../hooks/useOpenUpdate";
import { PhosphorIcon } from "../../../hooks/usePhosphorIcon";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import { useTablePagination } from "../../../hooks/useTablePagination";
import TypeChip from "../../patch/components/type-chip";
import PublishChip from "./components/publish-chip";
import ExpandedContent from "./table-expand-content";

const PatchNotes = () => {
  // State for expanded rows
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>();
  const { currentParams, setQueryParams } = useRememberQueryParams();

  const { open: openUpdate } = useOpenUpdate();
  const { open: openCreate } = useOpenCreate();

  // Get status from URL params, default to 'unpublished'
  const showPublished = currentParams?.show_published === "true";
  const currentStatus = showPublished ? "published" : "unpublished";

  // Use the pagination hook
  const { pagination, paginationParams } = useTablePagination({
    defaultRowsPerPage: 25,
    totalCount: 0, // Will be updated when data is loaded
  });

  const {
    data: patch_notes,
    isLoading,
    isFetching,
    isError,
  } = useGetPatchNotesQuery({
    search: currentParams?.q,
    page: paginationParams.page,
    per_page: paginationParams.per_page,
    status: currentStatus,
  });

  const [publish] = usePublishPatchNoteMutation();

  // Update total count when data is loaded
  if (
    patch_notes?.data.total !== undefined &&
    pagination.count !== patch_notes.data.total
  ) {
    pagination.count = patch_notes.data.total;
  }

  // Handle checkbox change
  const handleShowPublishedChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setQueryParams(
      {
        show_published: event.target.checked,
      },
      { retain: true }
    );
  };

  // Define strongly-typed columns for the UserResult data
  const columns: Array<ITableColumn<Partial<IPatchNotesResponse>, unknown>> = [
    {
      id: "id",
      label: "ID",
      getValue: (patch_note) => patch_note.id,
      sortable: true,
      width: 30,
    },
    {
      id: "version",
      label: "Version",
      getValue: (patch_note) => patch_note.version,
      sortable: true,
      width: 50,
    },
    {
      id: "title",
      label: "Title",
      getValue: (patch_note) => patch_note.title,
      sortable: true,
      width: 150,
    },
    {
      id: "type",
      label: "Type",
      getValue: (patch_note) => patch_note.type?.toUpperCase(),
      renderCell: (value, item) => <TypeChip type={item?.type ?? ""} />,
      sortable: true,
      width: 150,
    },
    {
      id: "status",
      label: "Status",
      getValue: (patch_note) => patch_note.is_published,
      renderCell: (value, item) => (
        <PublishChip published={item?.is_published ?? false} key={item.id} />
      ),
      width: 150,
    },

    {
      id: "updated_at",
      label: "Last Updated",
      getValue: (patch_note) =>
        moment(patch_note.updated_at).format(CONFIG.DATE_FORMAT_DISPLAY),
      sortable: true,
      width: 120,
    },
  ];

  const publishNote = async (id: string) => {
    try {
      const response = await publish(id).unwrap();
      enqueueSnackbar({
        variant: "success",
        message: response?.message ?? "Patch note created successfully!",
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Right-click menu items
  const getRightClickMenuItems = (patch_note: IPatchNotesResponse) => [
    {
      id: `publish-${patch_note.id}`,
      label: `${patch_note?.is_published ? "Unpublish" : "Publish"} Patch Note`,
      icon: <Confetti />,
      onClick: () => publishNote(`${patch_note.id}`),
    },
    {
      id: `edit-${patch_note.id}`,
      label: "Edit Patch Note",
      icon: <Pencil />,
      onClick: () =>
        openUpdate(
          MODULES.MASTERLIST.CHILDREN.PATCH_NOTES.ALIAS,
          patch_note.id
        ),
    },
    {
      id: `showPatch-${patch_note.id}`,
      label: "Visit Patch",
      icon: <ArrowSquareOut />,
      onClick: () =>
        navigate(
          {
            pathname: "../" + MODULES.PATCH.PATH,
            search: "?version=" + patch_note.version,
          },
          {
            state: {
              unpublished: !showPublished,
              prevLoc: location,
            },
          }
        ),
    },
    // {
    // 	id: `archive-${patch_note.id}`,
    // 	label: "Archive Patch Note",
    // 	icon: <Trash />,
    // 	onClick: () => console.log("Delete Role:", patch_note.id),
    // },
  ];

  return (
    <MasterlistLayout
      headerProps={{
        icon: (
          <PhosphorIcon
            icon={MODULES.MASTERLIST.CHILDREN.PATCH_NOTES.ICON_ON}
            size={24}
            color="var(--primary-main)"
            style={{ textAlign: "center", justifySelf: "center" }}
          />
        ),
        title: MODULES.MASTERLIST.CHILDREN.PATCH_NOTES.ALIAS,
        rightContent: (
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={showPublished}
                onChange={handleShowPublishedChange}
                color="primary"
              />
            }
            label="Published"
          />
        ),
        leftContent: (
          <>
            <CoolTip title="Upload Patch Note">
              <SmartButton
                shortcut={CONFIG.SHORTCUTS.CREATE}
                variant="contained"
                startIcon={<FirstAid color="var(--primary-contrastText)" />}
                onClick={() =>
                  openCreate(MODULES.MASTERLIST.CHILDREN.PATCH_NOTES.ALIAS)
                }
              >
                Create
              </SmartButton>
            </CoolTip>
            <CoolTip title="Write Patch Note">
              <SmartButton
                variant="contained"
                showShortcut={false}
                startIcon={<FileMd color="var(--primary-contrastText)" />}
                onClick={() => openCreate("mdown")}
              >
                Compose
              </SmartButton>
            </CoolTip>
          </>
        ),
      }}
    >
      <TableComponent<IPatchNotesResponse>
        columns={columns}
        isError={isError}
        data={patch_notes?.data.data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        expandedRows={expandedRows?? {}}
        onExpandedRowsChange={setExpandedRows}
        collapseValue={(patch_notes) => (
          <ExpandedContent patch_notes={patch_notes} />
        )}
        rightClickMenuItems={getRightClickMenuItems}
        pagination={pagination}
        actions={getRightClickMenuItems}
      />
    </MasterlistLayout>
  );
};

export default PatchNotes;
