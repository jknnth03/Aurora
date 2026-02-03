import { useState } from "react";
import MasterlistLayout from "../../components/layout/masterlist-layout/masterlist-layout";
import TableComponent, { ITableColumn } from "../../components/ui/table/table";
import { MODULES } from "../../config/modules/modules";
import { PhosphorIcon } from "../../hooks/usePhosphorIcon";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import { useTablePagination } from "../../hooks/useTablePagination";
import ExpandedContent from "./table-expand-content";

import {
  IAreaHeadResponse,
  useGetAreaHeadsQuery,
} from "../../features/api/aurora/area-head.api";
import ArchiveChip from "../(masterlist)/components/archive-chip";

const AreaHead = () => {
  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>();
  const { currentParams } = useRememberQueryParams();

  // Use the pagination hook
  const { pagination, paginationParams } = useTablePagination({
    defaultRowsPerPage: 25,
    totalCount: 0,
    isZeroBased: false,
  });
  const {
    data: areaHeads,
    isLoading,
    isFetching,
    isError,
  } = useGetAreaHeadsQuery({
    search: currentParams?.q,
    page: paginationParams.page,
    per_page: paginationParams.per_page,
    status: "active",
  });
  // Update total count when data is loaded
  if (
    areaHeads?.data.total !== undefined &&
    pagination.count !== areaHeads.data.total
  ) {
    pagination.count = areaHeads.data.total;
  }

  // Define strongly-typed columns for the UserResult data
  const columns: Array<ITableColumn<Partial<IAreaHeadResponse>, unknown>> = [
    {
      id: "idnumber",
      label: "ID No",
      getValue: (areaHead) => `${areaHead.id}`,
      sortable: true,
    },
    {
      id: "area_name",
      label: "Area Name",
      getValue: (areaHead) => areaHead.name,
      sortable: true,
    },

    {
      id: "regionId",
      label: "Region ID",
      getValue: (areaHead) => areaHead.region?.id,
      // renderCell: (value) => value,
      sortable: true,
    },
    {
      id: "regionName",
      label: "Region ID",
      getValue: (areaHead) => areaHead.region?.name,
      // renderCell: (value) => value,
      sortable: true,
    },
    {
      id: "areaHeadID",
      label: "Area Head ID",
      getValue: (areaHead) => areaHead?.area_head?.id,
      // renderCell: (value) => value,
      sortable: true,
    },
    {
      id: "areaHeadFullName",
      label: "Area Head Full Name",
      getValue: (areaHead) => areaHead?.area_head?.full_name,
      // renderCell: (value) => value,
      sortable: true,
    },
    {
      id: "areaHeadStatus",
      label: "Area Head Status",
      getValue: (areaHead) => {},
      renderCell: (value, item) => (
        <ArchiveChip
          archived={item?.area_head?.user_status === "active" && false}
          key={item.id}
        />
      ),
      sortable: true,
    },
  ];

  return (
    <MasterlistLayout
      headerProps={{
        icon: (
          <PhosphorIcon
            icon={MODULES.AREA_HEAD.ICON_ON}
            color="var(--primary-main)"
            size={24}
          />
        ),
        title: MODULES.AREA_HEAD.ALIAS,
      }}
    >
      <TableComponent<IAreaHeadResponse>
        columns={columns}
        isError={isError}
        data={areaHeads?.data.data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        expandedRows={expandedRows ?? {}}
        onExpandedRowsChange={setExpandedRows}
        collapseValue={(areaHead) => {
          return <ExpandedContent areaHead={areaHead} />;
        }}
        pagination={pagination}
      />
    </MasterlistLayout>
  );
};

export default AreaHead;
