import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { PaintBucket } from "@phosphor-icons/react";
import { CONFIG } from "../../../config/config";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import usePaletteTheme from "../../../hooks/useTheme";
import CoolTip from "../cool-tip/cool-tip";

const ThemePickerButton = () => {
	const { colorName } = usePaletteTheme();

	const { open, isOpen } = useOpenCreate("");

	return (
		<CoolTip title={`${CONFIG.DESCRIPTIONS.PALETTE_PICKER_TITLE} Current: ${colorName.replace(/_/g, " ")}`}>
			<Box className="finder" onClick={() => open(CONFIG.SUFFIX.theme_picker)}>
				<IconButton className="finder__icon-btn" size="small">
					<PaintBucket
						weight={isOpen(CONFIG.SUFFIX.theme_picker) ? "fill" : undefined}
						color="var(--primary-main)"
					/>
				</IconButton>
			</Box>
		</CoolTip>
	);
};

export default ThemePickerButton;
