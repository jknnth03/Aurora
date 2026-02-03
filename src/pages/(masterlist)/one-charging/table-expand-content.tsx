import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Briefcase } from "@phosphor-icons/react";
import { MODULES } from "../../../config/modules/modules";
import { IOneCharging } from "../../../features/api/aurora/masterlist/one-charging.api";
import { METAMODULES } from "../../../config/modules/meta-modules";

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
	margin: 0,
	height: "100%",
	backgroundColor: "transparent",
	borderRadius: theme.shape.borderRadius,
	boxShadow: theme.shadows[0],
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

const InfoItem = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	marginBottom: theme.spacing(1.5),
	gap: theme.spacing(1.5),
}));

const ExpandedContent = ({ charging }: { charging: IOneCharging }) => {
	return (
		<Box>
			<Grid>
				{/* Permissions Information */}
				<Grid size={{ xs: 12, md: 6 }}>
					<StyledPaper>
						<SectionTitle variant="h6">
							<Briefcase size={20} weight="bold" />[{charging.code}] {charging.name}
						</SectionTitle>

						<InfoItem>
							{METAMODULES.COMPANIES.ICON}
							<Label variant="body2">Company:</Label>
							<Value variant="body2">{charging.company_name}</Value>
						</InfoItem>

						<InfoItem>
							{METAMODULES.BUSINESS_UNITS.ICON}
							<Label variant="body2">Business Unit:</Label>
							<Value variant="body2">{charging.business_unit_name}</Value>
						</InfoItem>

						<InfoItem>
							{METAMODULES.DEPARTMENTS.ICON}
							<Label variant="body2">Department:</Label>
							<Value variant="body2">{charging.department_name}</Value>
						</InfoItem>

						<InfoItem>
							{METAMODULES.DEPARTMENT_UNITS.ICON}
							<Label variant="body2">Unit:</Label>
							<Value variant="body2">{charging.department_unit_name}</Value>
						</InfoItem>

						<InfoItem>
							{METAMODULES.SUB_UNITS.ICON}
							<Label variant="body2">Sub Unit:</Label>
							<Value variant="body2">{charging.sub_unit_name}</Value>
						</InfoItem>

						<InfoItem>
							{METAMODULES.LOCATIONS.ICON}
							<Label variant="body2">Location:</Label>
							<Value variant="body2">{charging.location_name}</Value>
						</InfoItem>
					</StyledPaper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default ExpandedContent;
