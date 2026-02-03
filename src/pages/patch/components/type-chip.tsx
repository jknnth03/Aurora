import Chip, { ChipProps } from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";
import CoolTip from "../../../components/ui/cool-tip/cool-tip";
import { getTypeInfo } from "../../../config/patch-note-items";

interface TypeChipProps extends Omit<ChipProps, "label" | "icon"> {
	type: string;
	size?: "small" | "medium";
}

const TypeChip: React.FC<TypeChipProps> = ({ type, size = "small", ...props }) => {
	const typeInfo = getTypeInfo(type);
	const theme = useTheme();

	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	const IconComponent = typeInfo.icon;

	if (isMobile && IconComponent) {
		return (
			<CoolTip title={typeInfo.label}>
				<IconComponent size={size === "small" ? 12 : 16} color={typeInfo.color} weight="duotone" />
			</CoolTip>
		);
	}
	return (
		<CoolTip title={typeInfo.label}>
			<Chip
				{...props}
				size={size}
				variant="outlined"
				label={typeInfo.label}
				icon={
					IconComponent ? (
						<IconComponent size={size === "small" ? 12 : 16} color={typeInfo.color} weight="duotone" />
					) : undefined
				}
				sx={{
					borderColor: typeInfo.color,
					color: typeInfo.color,
					backgroundColor: `${typeInfo.color}20`, // 20% opacity
					"& .MuiChip-label": {
						fontSize: size === "small" ? "0.7rem" : "0.75rem",
						fontWeight: 500,
						color: typeInfo.color,
					},
					"& .MuiChip-icon": {
						color: `${typeInfo.color} !important`,
						marginLeft: "4px",
					},
					"&:hover": {
						backgroundColor: `${typeInfo.color}30`, // 30% opacity on hover
						borderColor: typeInfo.color,
					},
					...props.sx,
				}}
			/>
		</CoolTip>
	);
};

export default TypeChip;
