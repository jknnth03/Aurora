import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import { styled } from "@mui/material/styles";
import { IStoreResponse } from "../../../features/api/aurora/masterlist/store.api";
import { IStoreChecklistResponse } from "../../../features/api/aurora/masterlist/store-checklist.api";
import { Divider } from "@mui/material";
import {
  Building,
  City,
  Hash,
  IdentificationCard,
  Note,
  Storefront,
} from "@phosphor-icons/react/dist/ssr";
import { useGetRegionQuery } from "../../../features/api/aurora/masterlist/regions.api";
import { useGetAreaQuery } from "../../../features/api/aurora/masterlist/areas.api";

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

const ExpandedContent = ({
  storeChecklist,
}: {
  storeChecklist: IStoreChecklistResponse;
}) => {
  // Function to get initials for avatar

  const {
    data: regionData,
    isLoading: isLoadingRegion,
    isFetching: isFetchingRegion,
  } = useGetRegionQuery(storeChecklist.store.region_id);

  const {
    data: areaData,
    isLoading: isLoadingArea,
    isFetching: isFetchingArea,
  } = useGetAreaQuery(storeChecklist.store.area_id);

  return (
    <Box sx={{ p: 3 }}>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        <Grid>
          <StyledPaper>
            <SectionTitle variant="h6">
              <Note size={20} weight="bold" />
              Store Details
            </SectionTitle>

            <InfoItem>
              <IdentificationCard size={20} />
              <Label variant="body2">Store ID:</Label>
              <Value variant="body2">{storeChecklist.store.id}</Value>
            </InfoItem>
            <InfoItem>
              <Storefront size={20} />
              <Label variant="body2">Store Name:</Label>
              <Value variant="body2">{storeChecklist.store.name}</Value>
            </InfoItem>
            <Divider sx={{ mb: 2 }} />
            <InfoItem>
              <Building size={20} />
              <Label variant="body2">Region ID:</Label>
              <Value variant="body2" sx={{ textTransform: "capitalize" }}>
                {storeChecklist.store.region_id}
              </Value>
            </InfoItem>
            <InfoItem>
              <Building size={20} />
              <Label variant="body2">Region Name:</Label>
              <Value variant="body2" sx={{ textTransform: "capitalize" }}>
                {regionData?.data?.name}
              </Value>
            </InfoItem>
            <Divider sx={{ mb: 2 }} />
            <InfoItem>
              <City size={20} />
              <Label variant="body2">Area ID:</Label>
              <Value variant="body2" sx={{ textTransform: "capitalize" }}>
                {storeChecklist.store.area_id}
              </Value>
            </InfoItem>
            <InfoItem>
              <City size={20} />
              <Label variant="body2">Area Name:</Label>
              <Value variant="body2" sx={{ textTransform: "capitalize" }}>
                {areaData?.data.name}
              </Value>
            </InfoItem>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExpandedContent;
