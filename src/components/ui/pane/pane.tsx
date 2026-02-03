import Box from "@mui/material/Box";
import Tabs, { TabsProps } from "@mui/material/Tabs";
import React, { ReactNode, SyntheticEvent, useEffect, useState } from "react";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import Tab from "@mui/material/Tab";

// Pane item interface
export interface PaneItem {
	id: string | number;
	label: string;
	icon?: string | React.ReactElement;
	disabled?: boolean;
	content: ReactNode;
}

// Pane props interface
export interface PaneProps extends Omit<TabsProps, "onChange" | "value"> {
	panes: PaneItem[];
	queryParamName?: string;
	defaultPane?: string | number;
	keepMounted?: boolean;
}

/**
 * TabPanel component
 */
const TabPanel = (props: {
	children?: React.ReactNode;
	index: string | number;
	value: string | number;
	keepMounted?: boolean;
}) => {
	const { children, value, index, keepMounted, ...other } = props;
	const isActive = value === index;

	if (!keepMounted && !isActive) {
		return null;
	}

	return (
		<div role="tabpanel" hidden={!isActive} id={`pane-panel-${index}`} aria-labelledby={`pane-${index}`} {...other}>
			{(isActive || keepMounted) && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
};

/**
 * A11y props for tabs
 */
const a11yProps = (id: string | number) => {
	return {
		id: `pane-${id}`,
		"aria-controls": `pane-panel-${id}`,
	};
};

/**
 * Pane component - Using standard MUI Tabs with reduced height
 */
const Pane: React.FC<PaneProps> = ({
	panes,
	queryParamName = "pane",
	defaultPane = panes[0]?.id || 0,
	keepMounted = false,
	...tabsProps
}) => {
	// Use query params hook
	const { currentParams, setQueryParams } = useRememberQueryParams();

	// Get current pane from URL or use default
	const getPaneFromUrl = () => {
		const urlPane = currentParams[queryParamName];
		if (urlPane === undefined) {
			return defaultPane;
		}

		// Handle numeric pane IDs
		if (!isNaN(Number(urlPane)) && panes.some((pane) => pane.id === Number(urlPane))) {
			return Number(urlPane);
		}

		// Handle string pane IDs
		if (panes.some((pane) => pane.id === urlPane)) {
			return urlPane;
		}

		return defaultPane;
	};

	// Initialize pane state
	const [value, setValue] = useState<string | number>(getPaneFromUrl());

	// Update pane when URL changes
	useEffect(() => {
		const paneFromUrl = getPaneFromUrl();
		setValue(paneFromUrl);
	}, [currentParams[queryParamName]]);

	// Handle pane change
	const handleChange = (_event: SyntheticEvent, newValue: string | number) => {
		setValue(newValue);
		setQueryParams({ [queryParamName]: newValue }, { retain: true });
	};

	// Set initial pane parameter if not present
	useEffect(() => {
		if (currentParams[queryParamName] === undefined) {
			setQueryParams({ [queryParamName]: defaultPane }, { retain: true });
		}
	}, []);

	return (
		<Box sx={{ width: "100%" }}>
			<Box sx={{ padding: 1, borderBottom: 1, borderColor: "divider" }}>
				<Tabs
					value={value}
					onChange={handleChange}
					aria-label="panes"
					sx={{
						minHeight: "36px",
						"& .MuiTabs-indicator": {
							// height: 2,
						},
					}}
					{...tabsProps}
				>
					{panes.map((pane) => (
						<Tab
							key={pane.id}
							label={pane.label}
							value={pane.id}
							icon={
								typeof pane.icon === "string" || React.isValidElement(pane.icon) ? pane.icon : undefined
							}
							iconPosition="start"
							disabled={pane.disabled}
							sx={{
								minHeight: "30px",
								textTransform: "none",
								fontWeight: "medium",
								lineHeight: 0,
								fontSize: "0.875rem",
								"& .MuiTab-iconWrapper": {
									marginRight: "6px",
									marginBottom: "0px !important",
								},
							}}
							{...a11yProps(pane.id)}
						/>
					))}
				</Tabs>
			</Box>

			{panes.map((pane) => (
				<TabPanel key={pane.id} value={value} index={pane.id} keepMounted={keepMounted}>
					{pane.content}
				</TabPanel>
			))}
		</Box>
	);
};

export default Pane;
