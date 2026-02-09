import { FirstAid, Pencil } from "@phosphor-icons/react";
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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import {
  IGradingResponse,
  useGetGradingsQuery,
} from "../../../features/api/aurora/masterlist/grading.api";
import GradingDialog from "./dialog/grading-dialog";

const Grading = () => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>();
  const { currentParams, setQueryParams } = useRememberQueryParams();

  const showInactive = currentParams?.status === "inactive";
  const { open: openUpdate } = useOpenUpdate();
  const { open: openCreate } = useOpenCreate();

  const handleShowActiveChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setQueryParams(
      {
        status: showInactive ? "active" : "inactive",
      },
      { retain: true },
    );
  };

  const { pagination, paginationParams } = useTablePagination({
    defaultRowsPerPage: 25,
    totalCount: 0,
    isZeroBased: false,
  });

  const {
    data: gradings,
    isLoading,
    isFetching,
    isError,
  } = useGetGradingsQuery({
    search: currentParams?.q,
    status: showInactive ? "inactive" : "active",
  });

  const columns: Array<ITableColumn<Partial<IGradingResponse>, unknown>> = [
    {
      id: "idnumber",
      label: "ID No",
      getValue: (grading) => grading.id,
      sortable: true,
    },
    {
      id: "cap_percentage",
      label: "Cap %",
      getValue: (grading) => grading.cap_percentage,
      sortable: true,
    },
    {
      id: "created_at",
      label: "Date Created",
      getValue: (grading) =>
        moment(grading.created_at).format(CONFIG.DATE_FORMAT_DISPLAY),
      sortable: true,
    },
  ];

  const getRightClickMenuItems = (
    grading: IGradingResponse,
  ): Array<ContextMenuItem<IGradingResponse>> => [
    {
      id: `edit-${grading.id}`,
      label: "Edit Grading",
      icon: <Pencil />,
      onClick: () =>
        openUpdate(MODULES.MASTERLIST.CHILDREN.GRADING.ALIAS, grading.id),
    },
  ];

  const handleOpenCreateDialog = () => {
    openCreate(MODULES.MASTERLIST.CHILDREN.GRADING.ALIAS);
  };

  return (
    <>
      <GradingDialog />
      <MasterlistLayout
        headerProps={{
          icon: (
            <PhosphorIcon
              icon={MODULES.MASTERLIST.CHILDREN.GRADING.ICON_ON}
              color="var(--primary-main)"
              size={24}
            />
          ),
          title: MODULES.MASTERLIST.CHILDREN.GRADING.ALIAS,
          leftContent: (
            <>
              <CoolTip title="Create Grading">
                <SmartButton
                  shortcut={CONFIG.SHORTCUTS.CREATE}
                  variant="contained"
                  startIcon={<FirstAid color="var(--primary-contrastText)" />}
                  onClick={handleOpenCreateDialog}>
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
        }}>
        <TableComponent<IGradingResponse>
          columns={columns}
          isError={isError}
          data={gradings?.data ?? []}
          isLoading={isLoading}
          isFetching={isFetching}
          expandedRows={expandedRows ?? {}}
          onExpandedRowsChange={setExpandedRows}
          rightClickMenuItems={getRightClickMenuItems}
          actions={getRightClickMenuItems}
          pagination={pagination}
        />
      </MasterlistLayout>
    </>
  );
};

export default Grading;
