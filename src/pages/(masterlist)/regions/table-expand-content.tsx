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

const ExpandedContent = ({ region }: { region: IRegionResponse }) => {
  // Function to get initials for avatar

  // Format permission text

  return (
    <Box sx={{ p: 3 }}>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid size={12}>
          <StyledPaper>
            <SectionTitle variant="h6">
              <Note size={20} weight="bold" />
              Region Head
            </SectionTitle>

            <InfoItem>
              <IdentificationCard size={20} />
              <Label variant="body2">ID:</Label>
              <Value variant="body2">{region.region_head_id}</Value>
            </InfoItem>
            <InfoItem>
              <User size={20} />
              <Label variant="body2">Name:</Label>
              <Value variant="body2">{region.region_head.full_name}</Value>
            </InfoItem>

            <InfoItem>
              {region.region_head.user_status === "active" ? (
                <CheckCircle size={20} />
              ) : (
                <MinusCircle size={20} />
              )}
              <Label variant="body2">Status:</Label>
              <Value variant="body2" sx={{ textTransform: "capitalize" }}>
                {region.region_head.user_status}
              </Value>
            </InfoItem>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExpandedContent;
