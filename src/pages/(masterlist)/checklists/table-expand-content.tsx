import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {
  Briefcase,
  FinnTheHuman,
  GenderFemale,
  IdentificationCard,
  ListChecks,
  Phone,
  ShieldStar,
  UserCircle,
} from "@phosphor-icons/react";
import { CONFIG } from "../../../config/config";
import { METAMODULES } from "../../../config/modules/meta-modules";
import { MODULES } from "../../../config/modules/modules";
import useFieldVisibility from "../../../hooks/useFieldVisibility";
import {
  getTextColorForBackground,
  stringAvatar,
  stringToColor,
} from "../../../utils/avatar";
import { IChecklistResponse } from "../../../features/api/aurora/masterlist/checklist.api";

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

const ExpandedContent = ({ checklist }: { checklist: IChecklistResponse }) => {
  const { visibility, toggleFieldVisibility } = useFieldVisibility();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatPermission = (permission: string) => {
    return permission.replace(/_/g, " ");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}></Box>
    </Box>
  );
};

export default ExpandedContent;
