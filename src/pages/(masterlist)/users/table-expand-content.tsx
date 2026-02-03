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
import { IUserResponse } from "../../../features/api/aurora/masterlist/user.api";
import useFieldVisibility from "../../../hooks/useFieldVisibility";
import {
  getTextColorForBackground,
  stringAvatar,
  stringToColor,
} from "../../../utils/avatar";

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

const ExpandedContent = ({ user }: { user: IUserResponse }) => {
  // Function to get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format permission text
  const formatPermission = (permission: string) => {
    return permission.replace(/_/g, " ");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            mr: 2,
            ...stringAvatar(
              `${user.first_name ?? CONFIG.EMPTY_TEXT} ${
                user.last_name ?? CONFIG.EMPTY_TEXT
              }`
            ).sx,
          }}
        >
          {getInitials(
            user.first_name ?? CONFIG.EMPTY_TEXT,
            user.last_name ?? CONFIG.EMPTY_TEXT
          )}
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {user.first_name ?? CONFIG.EMPTY_TEXT}{" "}
            {user.middle_name ?? CONFIG.EMPTY_TEXT
              ? user.middle_name ?? ""
              : CONFIG.EMPTY_TEXT}{" "}
            {user.last_name ?? CONFIG.EMPTY_TEXT}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {user.id_prefix} - {user.id_no}
          </Typography>
        </Box>
        <Chip
          label={user.role?.name ?? CONFIG.EMPTY_TEXT}
          color="primary"
          sx={{
            ml: "auto",
            textTransform: "uppercase",
            fontWeight: "bold",
            bgcolor: stringToColor(user.role?.name ?? CONFIG.EMPTY_TEXT),
            color: getTextColorForBackground(
              stringToColor(user.role?.name ?? CONFIG.EMPTY_TEXT)
            ),
          }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid size={{ xs: 12, md: 4 }}>
          <StyledPaper>
            <SectionTitle variant="h6">
              <FinnTheHuman size={20} weight="bold" />
              Personal Information
            </SectionTitle>

            <InfoItem>
              <IdentificationCard size={20} />
              <Label variant="body2">Employee ID:</Label>
              <Value variant="body2">
                {user.id_prefix} - {user.id_no}
              </Value>
            </InfoItem>
            <InfoItem>
              <GenderFemale size={20} />
              <Label variant="body2">Gender:</Label>
              <Value variant="body2" sx={{ textTransform: "capitalize" }}>
                {user.gender}
              </Value>
            </InfoItem>

            <InfoItem>
              <Phone size={20} />
              <Label variant="body2">Mobile:</Label>
              <Value variant="body2">
                {user.mobile_number ?? CONFIG.EMPTY_TEXT}
              </Value>
            </InfoItem>

            <InfoItem>
              <UserCircle size={20} />
              <Label variant="body2">Username:</Label>
              <Value variant="body2">{user?.username}</Value>
            </InfoItem>
          </StyledPaper>
        </Grid>

        {/* Employment Information */}
        <Grid size={{ xs: 12, md: 4 }}>
          <StyledPaper>
            <SectionTitle variant="h6">
              <Briefcase size={20} weight="bold" />
              Employment Information
            </SectionTitle>

            <InfoItem>
              {MODULES?.MASTERLIST.CHILDREN.ONE_CHARGING?.ICON}
              <Label variant="body2">Charging:</Label>
              <Value variant="body2">
                {user.one_charging?.name ?? CONFIG.EMPTY_TEXT}
              </Value>
            </InfoItem>
            <InfoItem>
              {METAMODULES?.COMPANIES.ICON}
              <Label variant="body2">Company:</Label>
              <Value variant="body2">
                {user.one_charging?.company_name ?? CONFIG.EMPTY_TEXT}
              </Value>
            </InfoItem>

            <InfoItem>
              {METAMODULES?.BUSINESS_UNITS.ICON}
              <Label variant="body2">Business Unit:</Label>
              <Value variant="body2">
                {user.one_charging?.business_unit_name ?? CONFIG.EMPTY_TEXT}
              </Value>
            </InfoItem>

            <InfoItem>
              {METAMODULES?.DEPARTMENTS.ICON}
              <Label variant="body2">Department:</Label>
              <Value variant="body2">
                {user.one_charging?.department_name ?? CONFIG.EMPTY_TEXT}
              </Value>
            </InfoItem>

            <InfoItem>
              {METAMODULES?.DEPARTMENT_UNITS.ICON}
              <Label variant="body2">Unit:</Label>
              <Value variant="body2">
                {user.one_charging?.department_unit_name ?? CONFIG.EMPTY_TEXT}
              </Value>
            </InfoItem>

            <InfoItem>
              {METAMODULES?.SUB_UNITS.ICON}
              <Label variant="body2">Sub Unit:</Label>
              <Value variant="body2">
                {user.one_charging?.sub_unit_name ?? CONFIG.EMPTY_TEXT}
              </Value>
            </InfoItem>

            <InfoItem>
              {METAMODULES?.LOCATIONS.ICON}
              <Label variant="body2">Location:</Label>
              <Value variant="body2">
                {user.one_charging?.location_name ?? CONFIG.EMPTY_TEXT}
              </Value>
            </InfoItem>
          </StyledPaper>
        </Grid>

        {/* Permissions Information */}
        <Grid size={{ xs: 12, md: 4 }}>
          <StyledPaper>
            <SectionTitle variant="h6">
              <ShieldStar size={20} weight="bold" />
              System Permissions
            </SectionTitle>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 12 }}>
                <InfoItem>
                  <ShieldStar size={20} />
                  <Label variant="body2">Role:</Label>
                  <Value variant="body2">
                    {user.role?.name ?? CONFIG.EMPTY_TEXT}
                  </Value>
                </InfoItem>
              </Grid>

              <Grid size={{ xs: 12, md: 12 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                  <ListChecks
                    size={20}
                    style={{ marginRight: "8px", marginTop: "2px" }}
                  />
                  <Label variant="body2">Permissions:</Label>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", pl: 4 }}>
                  {user.role.access_permission.map((permission, index) => (
                    <PermissionChip
                      key={index}
                      label={formatPermission(permission)}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExpandedContent;
