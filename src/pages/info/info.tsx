import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material/SvgIcon";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ArrowLeft, Icon } from "@phosphor-icons/react";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import IconToggle from "../../components/ui/icon-toggle/icon-toggle";
import { mdParams } from "../../config/config";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import "./sidebar.scss";
import { useGetPatchNotesQuery } from "../../features/api/aurora/masterlist/patch-notes.api";
import { MarkdownViewer } from "../../components/ui/markdown/markdown-viewer";

type MdParam = {
	name: string;
	link: string;
	markdown: string;
	icon: Icon;
};

// Get the query param from link
const getParamFromLink = (link: string): string => {
	// Handle links like "/info?qa-guide"
	const paramMatch = link.match(/\?([^&]+)/);
	return paramMatch ? paramMatch[1] : "";
};

// TypeScript interface for TabPanel props
interface TabPanelProps {
	children: React.ReactNode;
	isActive: boolean;
	id: string;
}

// Component with TypeScript typing
function TabPanel(props: TabPanelProps): ReactNode {
	const { children, isActive, id, ...other } = props;

	return (
		<Box
			role="tabpanel"
			hidden={!isActive}
			id={`info-panel-${id}`}
			aria-labelledby={`info-tab-${id}`}
			sx={{ height: "100%", width: "100%", overflow: "auto" }}
			{...other}
		>
			{isActive && children}
		</Box>
	);
}

// Info Sidebar Item component
interface InfoSidebarItemProps {
	item: MdParam;
	isActive: boolean;
	isDrawerOpen: boolean;
	onClick: (param: string) => void;
}

const InfoSidebarItem: React.FC<InfoSidebarItemProps> = ({ item, isActive, isDrawerOpen, onClick }) => {
	// Get the query param from the link
	const param = getParamFromLink(item.link);

	// Handle click event
	const handleClick = () => {
		onClick(param);
	};

	return (
		<Tooltip title={!isDrawerOpen ? item.name : ""} placement="right" arrow>
			<Box
				className={`info-sidebar__menu-item ${isActive ? "info-sidebar__menu-item--active" : ""}`}
				onClick={handleClick}
			>
				<Box className="info-sidebar__menu-icon">
					<span>{<item.icon />}</span>
				</Box>
				{isDrawerOpen && <Box className="info-sidebar__menu-text">{item.name}</Box>}
			</Box>
		</Tooltip>
	);
};

export default function Info() {
	const { data } = useGetPatchNotesQuery({});

	// Use the custom hook to remember the selected tab in URL
	const { currentParams, setQueryParams, removeQueryParams } = useRememberQueryParams();
	const navigate = useNavigate();

	// Sidebar state
	const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

	// Create an array from mdParams for easier mapping
	const tabsData = Object.values(mdParams);

	// Extract all possible param names from mdParams
	const allParamNames = tabsData.map((tab) => getParamFromLink(tab.link));

	// Function to find which tab is active based on the URL
	const findActiveParam = (): string => {
		// Check URL for direct paramName matches (e.g., ?secure-password)
		for (const key of Object.keys(currentParams)) {
			if (allParamNames.includes(key)) {
				return key;
			}
		}

		// Default to first tab if no match found
		return getParamFromLink(tabsData[0].link);
	};

	// Get the active parameter
	const [activeParam, setActiveParam] = useState<string>(findActiveParam());

	// Update active parameter whenever URL changes
	useEffect(() => {
		const newActiveParam = findActiveParam();
		if (newActiveParam !== activeParam) {
			setActiveParam(newActiveParam);
		}
	}, [currentParams]);

	// Toggle sidebar open/closed
	const handleDrawerToggle = () => {
		setIsDrawerOpen(!isDrawerOpen);
	};

	// Handle tab changes - properly using the setQueryParams from custom hook
	const handleTabChange = (param: string): void => {
		// First clear all existing tab parameters
		allParamNames.forEach((name) => {
			if (name in currentParams) {
				removeQueryParams(name);
			}
		});

		// Then set the new parameter using the hook's function
		const newParams: Record<string, string> = {};
		newParams[param] = "";
		setQueryParams(newParams);

		// Also update local state for immediate UI response
		setActiveParam(param);
	};

	return (
		<Box
			sx={{
				width: "100vw",
				overflow: "hidden",
				display: "flex",
				height: "100vh",
			}}
		>
			{/* Sidebar */}
			<Box className={`sidebar sidebar--${isDrawerOpen}`}>
				{/* Drawer toggle button */}
				<Box className="info-drawer-trigger" onClick={handleDrawerToggle}>
					<IconToggle isExpanded={isDrawerOpen} onToggle={handleDrawerToggle} />
				</Box>

				{/* Sidebar header */}
				<Box className="info-sidebar__header">
					<Box className="info-sidebar__header-content">
						<Box className="info-sidebar__header-icon">
							{
								<IconButton
									onClick={() => {
										if (window.history.length > 1) navigate(-1);
									}}
								>
									<ArrowLeft />
								</IconButton>
							}
							<span>📚</span>
						</Box>
						<Typography variant="h6" component="div" className="info-sidebar__title">
							Documentation
						</Typography>
					</Box>
				</Box>

				{/* Sidebar content */}
				<Box className="info-sidebar__content">
					<Box className="info-sidebar__menu">
						{/* Active background element that moves between items */}
						<Box className="info-sidebar__active-bg" />

						{/* Menu items */}
						{tabsData.map((tab) => (
							<InfoSidebarItem
								key={getParamFromLink(tab.link)}
								item={tab}
								isActive={getParamFromLink(tab.link) === activeParam}
								isDrawerOpen={isDrawerOpen}
								onClick={handleTabChange}
							/>
						))}
					</Box>
				</Box>

				{/* Optional: Sidebar footer */}
				<Box className="info-sidebar__footer">
					<Typography variant="caption" color="textSecondary">
						{isDrawerOpen ? "Documentation v1.0" : "v1.0"}
					</Typography>
				</Box>
			</Box>

			{/* Content panels */}
			<Box sx={{ flex: 1, overflow: "hidden" }}>
				{tabsData.map((tab) => (
					<TabPanel
						key={getParamFromLink(tab.link)}
						id={getParamFromLink(tab.link)}
						isActive={getParamFromLink(tab.link) === activeParam}
					>
						<MarkdownViewer src={{ type: "text", content: tab.markdown }} />
					</TabPanel>
				))}
			</Box>
		</Box>
	);
}
