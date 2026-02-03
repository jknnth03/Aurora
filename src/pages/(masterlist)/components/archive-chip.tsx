import Chip from "@mui/material/Chip";
import { CheckFat, TrayArrowDown } from "@phosphor-icons/react";
import React from "react";

interface ArchiveChipProps {
  archived: boolean;
}

const ArchiveChip: React.FC<ArchiveChipProps> = ({ archived }) => {
  return (
    <Chip
      icon={
        archived ? (
          <TrayArrowDown color="var(--warning-main)" size={16} />
        ) : (
          <CheckFat size={16} weight="fill" color="var(--success-main)" />
        )
      }
      label={archived ? "Inactive" : "Active"}
      color={archived ? "warning" : "success"}
      variant="outlined"
      size="small"
    />
  );
};

export default ArchiveChip;
