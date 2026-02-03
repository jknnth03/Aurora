import Chip from "@mui/material/Chip";
import React from "react";

interface StatusChipProps {
  status: string;
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  let statusColor;
  if (status === "Rejected") {
    statusColor = "red";
  } else if (status === "Done" || status === "Completed") {
    statusColor = "orange";
  } else if (status === "Overdue") {
    statusColor = "red";
  } else {
    statusColor = "skyblue";
  }
  return (
    <Chip
      label={status}
      sx={{
        backgroundColor: statusColor,
        color: "white",
      }}
      variant="filled"
      size="small"
    />
  );
};

export default StatusChip;
