import {
  FirstAid,
  Key,
  Pencil,
  Trash,
  TrayArrowUp,
} from "@phosphor-icons/react";
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
import {
  IRegionHeadResponse,
  useGetRegionHeadsQuery,
} from "../../features/api/aurora/region-head.api";

const RegionHead = () => {
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
    data: regionHeads,
    isLoading,
    isFetching,
    isError,
  } = useGetRegionHeadsQuery({
    search: currentParams?.q,
    page: paginationParams.page,
    per_page: paginationParams.per_page,
    status: "active",
  });
  // Update total count when data is loaded
  if (
    regionHeads?.data.total !== undefined &&
    pagination.count !== regionHeads.data.total
  ) {
    pagination.count = regionHeads.data.total;
  }

  // Define strongly-typed columns for the UserResult data
  const columns: Array<ITableColumn<Partial<IRegionHeadResponse>, unknown>> = [
    {
      id: "idnumber",
      label: "ID No",
      getValue: (regionHead) => `${regionHead.id}`,
      sortable: true,
    },
    {
      id: "region_name",
      label: "Region Name",
      getValue: (regionHead) => regionHead.name,
      sortable: true,
    },
    {
      id: "region_head_name",
      label: "Region Head Name",
      getValue: (regionHead) => regionHead?.region_head?.full_name,
      sortable: true,
    },
    {
      id: "regionHeadStatus",
      label: "Region Head Status",
      getValue: (areaHead) => {},
      renderCell: (value, item) => (
        <ArchiveChip
          archived={item?.region_head?.user_status === "active" && false}
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
            icon={MODULES.REGION_HEAD.ICON_ON}
            color="var(--primary-main)"
            size={24}
          />
        ),
        title: MODULES.REGION_HEAD.ALIAS,
      }}
    >
      <TableComponent<IRegionHeadResponse>
        columns={columns}
        isError={isError}
        data={regionHeads?.data.data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        expandedRows={expandedRows ?? {}}
        onExpandedRowsChange={setExpandedRows}
        collapseValue={(regionHead) => {
          return <ExpandedContent regionHead={regionHead} />;
        }}
        pagination={pagination}
      />
    </MasterlistLayout>
  );
};

export default RegionHead;
