import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {
  CheckCircle,
  GenderFemale,
  IdentificationCard,
  MinusCircle,
  Note,
  Phone,
  ShieldStar,
  User,
  UserCircle,
} from "@phosphor-icons/react";
import { CONFIG } from "../../../config/config";
import { METAMODULES } from "../../../config/modules/meta-modules";
import { MODULES } from "../../../config/modules/modules";
import {
  getTextColorForBackground,
  stringAvatar,
  stringToColor,
} from "../../../utils/avatar";
import { IRegionResponse } from "../../../features/api/aurora/masterlist/regions.api";
import { IAreaResponse } from "../../../features/api/aurora/masterlist/areas.api";

// Styled components
const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "100%",
  backgroundColor: "transparent",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[0],
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(1.5),
  gap: theme.spacing(1.5),
}));

const Label = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
  minWidth: 100,
}));

const Value = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  display: "flex",
}));

const PermissionChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  textTransform: "capitalize",
}));

const ExpandedContent = ({ area }: { area: IAreaResponse }) => {
  // Function to get initials for avatar

  // Format permission text

  return <Box sx={{ p: 3 }}></Box>;
};

export default ExpandedContent;
