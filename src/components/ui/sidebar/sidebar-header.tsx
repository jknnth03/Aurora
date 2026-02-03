import Box from "@mui/material/Box";

import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router";
import Aurora from "../../../assets/aurora.svg?react";
import { CONFIG } from "../../../config/config";
import { MODULES } from "../../../config/modules/modules";
import ContextMenu from "../context-menu/context-menu";
import useContextMenu from "../context-menu/useContextMenu";
const SidebarHeader = () => {
	// Use our custom hook for context menu instead of local state
	const { contextMenu, handleContextMenu, handleCloseContextMenu } = useContextMenu();

	const navigate = useNavigate();

	const handleNavigateToHome = () => {
		navigate(MODULES.DASHBOARD.PATH);
	};

	const getRightClickMenuItems = () => [
		{
			id: `navigate`,
			label: "Home",
			icon: <Aurora height={20} width={"auto"} color="var(--primary-main)" />,
			onClick: handleNavigateToHome,
		},
	];
	return (
		<>
			<Box
				className="sidebar__header"
				onContextMenu={(event) => handleContextMenu(event, getRightClickMenuItems())}
				onClick={handleNavigateToHome}
			>
				<Box className="sidebar__header-content">
					<Box className="sidebar__header-icon">
						<Aurora height={20} width={20} color="var(--primary-main)" />
					</Box>
					<Typography variant="h6" component="div" className="sidebar__title">
						{CONFIG.APP_NAME}
					</Typography>
				</Box>
			</Box>
			<ContextMenu
				contextMenu={contextMenu}
				menuItems={getRightClickMenuItems}
				onClose={handleCloseContextMenu}
			/>
		</>
	);
};

export default SidebarHeader;
