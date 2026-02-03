import Box from "@mui/material/Box";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import { PaintBucket } from "@phosphor-icons/react";
import { useCallback } from "react";
import { CONFIG } from "../../../../config/config";
import { useOpenCreate } from "../../../../hooks/useOpenCreate";
import usePaletteTheme from "../../../../hooks/useTheme";
import LightDarkModeSwitch from "../../light-dark-mode-switch/light-dark-mode-toggle";
import { ResponsiveDialog } from "../../responsive-dialog";
import ThemeColorCard from "./theme-color-card";

const ThemePickerDialog = () => {
	const { close: closeCreate, isOpen: isCreateOpen } = useOpenCreate("");
	const { colorList, mode, handleColorChange, colorName } = usePaletteTheme();

	const mappedColors = Object.entries(colorList);

	const openDialogCreate = isCreateOpen(CONFIG.SUFFIX.theme_picker);
	const onClose = useCallback(() => {
		// removeQueryParams({ qKey });
		closeCreate();
	}, [closeCreate]);
	return (
		<ResponsiveDialog open={openDialogCreate} onClose={onClose} dialogProps={{ maxWidth: "lg", fullWidth: true }}>
			<DialogTitle>
				<span style={{ display: "flex", gap: "1rem", alignItems: "center", letterSpacing: 4 }}>
					<PaintBucket weight="fill" color="var(--primary-main)" />
					{CONFIG.DESCRIPTIONS.PALETTE_PICKER_TITLE}
					<LightDarkModeSwitch size="xxs" />
				</span>
				<DialogContentText>{CONFIG.DESCRIPTIONS.PALETTE_PICKER_DESCRIPTION}</DialogContentText>
				<DialogContentText variant="caption">
					{CONFIG.DESCRIPTIONS.PALETTE_PICKER_SUBTITLE}
				</DialogContentText>{" "}
			</DialogTitle>{" "}
			<Divider />{" "}
			<DialogContent>
				<Box display={"flex"} flexWrap={"wrap"} gap={10} p={2}>
					<ThemeColorCard
						key={CONFIG.DEFAULT_COLOR}
						keyName={CONFIG.DEFAULT_COLOR}
						label={`Default ${CONFIG.DEFAULT_COLOR}`}
						value={colorList.Orange}
						selected={CONFIG.DEFAULT_COLOR === colorName}
						disabled={CONFIG.DEFAULT_COLOR === colorName}
						mode={mode}
						onPick={handleColorChange}
					/>
					{mappedColors
						?.filter(([keyName, value]) => keyName !== CONFIG.DEFAULT_COLOR)
						?.map(([keyName, value]) => {
							return (
								<ThemeColorCard
									label={keyName.replace(/_/g, " ")}
									key={keyName}
									keyName={keyName}
									value={value}
									disabled={colorName === keyName}
									selected={colorName === keyName}
									mode={mode}
									onPick={handleColorChange}
								/>
							);
						})}
				</Box>
			</DialogContent>
		</ResponsiveDialog>
	);
};

export default ThemePickerDialog;
