import Chip from "@mui/material/Chip";
import { EyeClosed, RocketLaunch } from "@phosphor-icons/react";
import React from "react";

interface PublishChipProps {
  published: boolean;
}

const PublishChip: React.FC<PublishChipProps> = ({ published }) => {
  return (
    <Chip
      icon={
        published ? (
          <RocketLaunch size={16} weight="fill" color="var(--success-main)" />
        ) : (
          <EyeClosed size={16} />
        )
      }
      label={published ? "Published" : "Unpublished"}
      color={published ? "success" : "default"}
      variant="outlined"
      size="small"
    />
  );
};

export default PublishChip;
