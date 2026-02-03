import Chip from "@mui/material/Chip";
import { alpha, emphasize, styled } from "@mui/material/styles";

export const Panko = styled(Chip)(({ theme }) => {
	return {
		backgroundColor: alpha(theme.palette.primary.light, 0.1),
		height: theme.spacing(3),
		color: theme.palette.text.primary,
		fontWeight: theme.typography.fontWeightRegular,

		"&:hover, &:focus": {
			backgroundColor: emphasize(theme.palette.grey[100], 0.06),
			...theme.applyStyles("dark", {
				backgroundColor: emphasize(theme.palette.grey[800], 0.06),
			}),
		},
		"&:active": {
			boxShadow: theme.shadows[1],
			backgroundColor: emphasize(theme.palette.grey[100], 0.12),
			...theme.applyStyles("dark", {
				backgroundColor: emphasize(theme.palette.grey[800], 0.12),
			}),
		},
		...theme.applyStyles("dark", {
			backgroundColor: theme.palette.grey[800],
		}),
	};
}) as typeof Chip; // TypeScript only: need a type cast here because https://github.com/Microsoft/TypeScript/issues/26591
