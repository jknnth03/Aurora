// components/shared/theme-picker/theme-color-card.tsx

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { PaletteMode } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Eyedropper, Heart, PaintBucket } from "@phosphor-icons/react";
import React, { useCallback } from "react";
import { ThemeMode } from "../../../../types/theme-types";
import CoolTip from "../../cool-tip/cool-tip";
import useContextMenu from "../../context-menu/useContextMenu";
import ContextMenu, { ContextMenuItem } from "../../context-menu/context-menu";

interface ThemeColorCardProps {
	keyName: string;
	label: string;
	value: ThemeMode;
	mode: PaletteMode;
	onPick: (key: string) => void;
	disabled?: boolean;
	selected?: boolean;
}

const ThemeColorCard: React.FC<ThemeColorCardProps> = ({
	keyName,
	value,
	mode,
	label,
	onPick,
	disabled = false,
	selected = false,
}) => {
	const { contextMenu, handleContextMenu, handleCloseContextMenu } = useContextMenu<ThemeColorCardProps>();
	const getContextMenuItems = useCallback(
		(theme: ThemeColorCardProps): Array<ContextMenuItem<ThemeColorCardProps>> => [
			{
				id: `pick-color`,
				label: theme.selected ? `Selected` : `Select as Theme`,
				disabled: theme.disabled,
				icon: <PaintBucket size={18} weight="bold" />,
				onClick: () => {
					onPick(theme.keyName);
				},
			},
		],
		[]
	);

	return (
		<>
			<CoolTip title={`${label} Theme`}>
				<Box
					sx={{
						borderRadius: 1,
						overflow: "clip",
						cursor: disabled ? "default" : "pointer",
						// filter: disabled ?? selected ? "grayscale(80%)" : "none",

						border: "1px solid var(--background-contrastText)",
						":hover": {
							animation: disabled ? "none" : `crown-bounce 2s ease infinite`,
						},
					}}
					onContextMenu={(event) =>
						handleContextMenu(event, { keyName, value, mode, label, onPick, disabled, selected })
					}
					onClick={() => onPick(keyName)}
				>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							backgroundColor: value[mode].background.dark,
							minWidth: 200,
							minHeight: 175,
						}}
					>
						<Box
							sx={{ backgroundColor: value[mode].primary.main, width: "100%", p: 1 }}
							aria-label="Colors"
							title={`${keyName.replace(/_/g, " ")} Theme`}
						>
							<Typography color={value[mode].primary.contrastText}>{label}</Typography>
						</Box>

						<Box sx={{ display: "flex", flex: 1, flexDirection: "column", p: 1, gap: 1 }}>
							<Box
								sx={{
									flex: 1,
									display: "flex",
									width: "100%",
									height: "100%",
								}}
							>
								<Box
									sx={{
										backgroundColor: value[mode].background.light,
										borderRadius: 1,
										flex: 1,
									}}
								></Box>
							</Box>

							<Button
								size="small"
								variant="contained"
								disableElevation
								disabled={disabled ?? selected}
								endIcon={
									<PaintBucket
										weight="fill"
										color={selected ? "var(--primary-main)" : "var(--background-main)"}
									/>
								}
								sx={{ backgroundColor: value[mode].primary.light }}
							>
								{selected ? "selected" : "Select"}
							</Button>
						</Box>
					</Box>
				</Box>
			</CoolTip>
			<ContextMenu<ThemeColorCardProps>
				contextMenu={contextMenu}
				menuItems={getContextMenuItems}
				onClose={handleCloseContextMenu}
				slotProps={{}}
			/>
		</>
	);
};

export default ThemeColorCard;
