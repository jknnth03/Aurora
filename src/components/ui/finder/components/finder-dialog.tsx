import Box from "@mui/material/Box";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { HandTap, Heart, MouseRightClick } from "@phosphor-icons/react";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import DeadCow from "../../../../assets/dead-cow.svg?react";
import MouskaTool from "../../../../assets/mickey.svg?react";
import { CONFIG } from "../../../../config/config";
import { MODULES, TModule } from "../../../../config/modules/modules";
import { useOpenCreate } from "../../../../hooks/useOpenCreate";
import { PhosphorIcon } from "../../../../hooks/usePhosphorIcon";
import { useRememberQueryParams } from "../../../../hooks/useRememberQueryParams";
import { stringToColor } from "../../../../utils/avatar";
import { useBookmark } from "../../bookmarks/useBookmark";
import ContextMenu from "../../context-menu/context-menu";
import useContextMenu from "../../context-menu/useContextMenu";
import CoolTip from "../../cool-tip/cool-tip";
import { ResponsiveDialog } from "../../responsive-dialog";
import SearchField from "../../search-field/search-field";
import useSidebarContextMenu from "../../sidebar/useSidebarContextMenu";

// Import utility items
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useHotkeys } from "react-hotkeys-hook";
import { FinderIcon, finderDescription, finderShortcut, finderSubTitle, finderTitle } from "../finder";
import { useUtilityItems } from "./useUtilityItem";
import { UtilityItem, UtilityListItem, tooldescription, toolname } from "./utility-item";
import usePermission from "../../../../hooks/usePermission";

type Module = TModule;

interface FlatModule {
	module: Module;
	fullPath: string;
	searchableText: string;
	parentKey?: string;
	depth: number;
}

const qKey = "find";

// Memoized module item to prevent unnecessary re-renders
const ModuleListItem = memo(
	({
		item,
		index,
		isBookmarked,
		onModuleClick,
		onContextMenu,
	}: {
		item: FlatModule;
		index: number;
		isBookmarked: boolean;
		onModuleClick: (module: FlatModule) => void;
		onContextMenu: (event: React.MouseEvent, module: Module) => void;
	}) => {
		const iconColor = useMemo(() => stringToColor(item.module?.ALIAS || ""), [item.module?.ALIAS]);

		const theme = useTheme();
		const isMobile = useMediaQuery(theme.breakpoints.down("md"));

		const handleClick = useCallback(() => {
			onModuleClick(item);
		}, [item, onModuleClick]);

		const handleContextMenu = useCallback(
			(event: React.MouseEvent) => {
				onContextMenu(event, item.module);
			},
			[item.module, onContextMenu]
		);

		return (
			<ListItem key={`${item.module.KEY}-${index}`} disablePadding>
				<ListItemButton
					sx={{ borderRadius: 1 }}
					disableRipple
					disableTouchRipple
					onClick={handleClick}
					onContextMenu={handleContextMenu}
				>
					<ListItemIcon>
						<PhosphorIcon icon={item.module.ICON_ON} size={16} color={iconColor} />
					</ListItemIcon>
					<ListItemText
						primary={
							<Typography variant="body2" sx={{ display: "flex", gap: 1, alignItems: "center" }}>
								{item.module.ALIAS}
							</Typography>
						}
						secondary={
							<>
								<Typography variant="caption" color="text.secondary">
									{item.module.DESCRIPTION || "No description available"}{" "}
								</Typography>
								<Typography
									variant="caption"
									display="block"
									sx={{ color: "text.disabled", mt: 0.5, fontFamily: "monospace" }}
								>
									Path: {item.fullPath}
								</Typography>
							</>
						}
					/>
					<ListItemIcon sx={{ display: "flex", gap: 2 }}>
						<CoolTip title={isMobile ? "Hold item to see more" : "You can right click this item"}>
							{isMobile ? <HandTap /> : <MouseRightClick weight="fill" />}
						</CoolTip>
						<CoolTip title={isBookmarked ? "This item is bookmarked" : "This item is not bookmarked"}>
							<Heart
								weight={isBookmarked ? "fill" : undefined}
								color={isBookmarked ? "var(--error-light)" : undefined}
							/>
						</CoolTip>
					</ListItemIcon>
				</ListItemButton>
			</ListItem>
		);
	}
);

const FinderDialog = () => {
	const navigate = useNavigate();
	const { bookmarks } = useBookmark();
	const { currentParams, removeQueryParams } = useRememberQueryParams();
	const { permittedModules } = usePermission();

	const { getMenuItemsForModule } = useSidebarContextMenu();
	const { contextMenu, handleContextMenu, handleCloseContextMenu } = useContextMenu<TModule>();
	const { close: closeCreate, isOpen: isCreateOpen } = useOpenCreate("");
	const searchFieldRef = useRef<HTMLDivElement>(null);

	// Use the separated utility items
	const utilityItems = useUtilityItems();

	const openDialogCreate = isCreateOpen(CONFIG.SUFFIX.finder);

	// O(1) - Create lookup map for modules (optimization from O(n) recursive search to O(1) lookup)
	const moduleKeyMap = useMemo(() => {
		const map = new Map<string, Module>();

		const buildMap = (modules: Module[]) => {
			modules.forEach((module) => {
				if (module.KEY) {
					map.set(module.KEY, module);
				}
				if (module.CHILDREN) {
					buildMap(Object.values(module.CHILDREN));
				}
			});
		};

		buildMap(permittedModules);
		return map;
	}, [permittedModules]);

	// O(1) - Optimized module finder using Map instead of recursive search
	const findModuleByKey = useCallback(
		(key: string): Module | undefined => {
			return moduleKeyMap.get(key);
		},
		[moduleKeyMap]
	);

	// O(n) - Create bookmarks Set for O(1) lookup instead of O(n) array search
	const bookmarkedAliasesSet = useMemo(() => {
		return new Set(bookmarks.map((bookmark) => bookmark.name));
	}, [bookmarks]);

	// O(1) - Optimized bookmark check using Set
	const isBookmarkedOptimized = useCallback(
		(alias: string): boolean => {
			return bookmarkedAliasesSet.has(alias);
		},
		[bookmarkedAliasesSet]
	);

	// O(n) - Flattened modules with pre-computed parent lookup
	const flattenedModules = useMemo(() => {
		const menuItems = permittedModules;
		const flattened: FlatModule[] = [];

		const flattenModule = (module: Module, parentKey?: string, depth: number = 0) => {
			const searchableText = `${parentKey ? parentKey?.replace(/_/g, " ") : ""} ${module.ALIAS} ${
				module.DESCRIPTION || ""
			} ${module.PATH}`.toLowerCase();

			// Only add the module if it doesn't have children (leaf nodes only)
			if (!module.CHILDREN || Object.keys(module.CHILDREN).length === 0) {
				flattened.push({
					module,
					fullPath: module.PATH,
					searchableText,
					parentKey: depth === 0 ? undefined : parentKey || module.KEY,
					depth,
				});
			}

			// Recursively flatten children
			if (module.CHILDREN) {
				Object.values(module.CHILDREN).forEach((child) => {
					flattenModule(child as Module, parentKey || module.KEY, depth + 1);
				});
			}
		};

		menuItems.forEach((module) => flattenModule(module));
		return flattened;
	}, []);

	// O(n) - Optimized search results with efficient deduplication
	const searchResults = useMemo(() => {
		const searchTerm = currentParams[qKey];
		const results: (FlatModule | UtilityItem)[] = [];

		if (!searchTerm) {
			// No search term - show all items
			results.push(...flattenedModules, ...utilityItems);
		} else {
			const searchLower = searchTerm.toLowerCase();

			if (searchLower === "bookmarked" || searchLower === "bookmark") {
				// O(n) - Use Set for O(1) deduplication instead of O(n²) with Array.find()
				const seenModuleKeys = new Set<string>();
				const combinedModules: FlatModule[] = [];

				// Add bookmarked modules first
				flattenedModules.forEach((item) => {
					if (isBookmarkedOptimized(item.module.ALIAS)) {
						combinedModules.push(item);
						if (item.module.KEY !== undefined) {
							seenModuleKeys.add(item.module.KEY);
						}
					}
				});

				// Add text matching modules (if not already included)
				flattenedModules.forEach((item) => {
					if (
						item.searchableText.includes(searchLower) &&
						item.module.KEY !== undefined &&
						!seenModuleKeys.has(item.module.KEY)
					) {
						combinedModules.push(item);
					}
				});

				// Add matching utilities
				const textMatchingUtilities = utilityItems.filter((item) => item.searchableText.includes(searchLower));

				results.push(...combinedModules, ...textMatchingUtilities);
			} else {
				// Normal search - filter all items by search term
				const filteredModules = flattenedModules.filter((item) => item.searchableText.includes(searchLower));

				const filteredUtilities = utilityItems.filter((item) => item.searchableText.includes(searchLower));

				results.push(...filteredModules, ...filteredUtilities);
			}
		}

		return results;
	}, [flattenedModules, utilityItems, currentParams, isBookmarkedOptimized]);

	// O(n) - Optimized grouped results using Map lookup instead of recursive search
	const groupedResults = useMemo(() => {
		const groups: Record<string, { modules: FlatModule[]; utilities: UtilityItem[]; groupModule?: Module }> = {};

		searchResults.forEach((item) => {
			if ("module" in item) {
				// Handle regular modules - O(1) lookup instead of O(n) recursive search
				const groupKey = item.parentKey || item.module.KEY;
				const groupModule = item.parentKey ? findModuleByKey(item.parentKey) : item.module;
				const groupName = groupModule?.ALIAS || String(groupKey);

				if (!groups[groupName]) {
					groups[groupName] = { modules: [], utilities: [], groupModule };
				}
				groups[groupName].modules.push(item);
			} else {
				// Handle utility items - group under "Tools"
				const groupName = toolname;
				if (!groups[groupName]) {
					groups[groupName] = { modules: [], utilities: [] };
				}
				groups[groupName].utilities.push(item);
			}
		});

		return groups;
	}, [searchResults, findModuleByKey]);

	// Memoized event handlers
	const handleModuleClick = useCallback(
		(module: FlatModule) => {
			closeCreate();
			removeQueryParams([qKey]);
			navigate(module.fullPath);
		},
		[closeCreate, removeQueryParams, navigate]
	);

	const onClose = useCallback(() => {
		removeQueryParams([qKey]);
		closeCreate();
	}, [removeQueryParams, closeCreate]);

	useHotkeys(
		finderShortcut,
		() => {
			onClose();
		},
		{
			enabled: openDialogCreate,
			preventDefault: true,
		}
	);

	useEffect(() => {
		// Only focus the search field when dialog first opens
		if (openDialogCreate) {
			const timer = setTimeout(() => {
				if (searchFieldRef.current) {
					const input =
						searchFieldRef.current.querySelector('input[name="TextField"]') ||
						searchFieldRef.current.querySelector("input");
					if (input) {
						(input as HTMLInputElement).focus();
					}
				}
			}, 200);

			return () => clearTimeout(timer);
		}
	}, [openDialogCreate]);

	// Memoized render functions
	const renderUtilityList = useCallback(
		(utilities: UtilityItem[]) => (
			<List dense>
				{utilities.map((item, index) => (
					<UtilityListItem key={`${item.key}-${index}`} item={item} index={index} />
				))}
			</List>
		),
		[]
	);

	const renderModuleList = useCallback(
		(modules: FlatModule[]) => (
			<List dense>
				{modules.map((item, index) => (
					<ModuleListItem
						key={`${item.module.KEY}-${index}`}
						item={item}
						index={index}
						isBookmarked={isBookmarkedOptimized(item.module?.ALIAS)}
						onModuleClick={handleModuleClick}
						onContextMenu={handleContextMenu}
					/>
				))}
			</List>
		),
		[isBookmarkedOptimized, handleModuleClick, handleContextMenu]
	);

	const renderGroupedModules = useCallback(() => {
		const groupEntries = Object.entries(groupedResults);

		return groupEntries.map(([groupName, { modules, utilities, groupModule }], groupIndex) => {
			return (
				<Box key={groupName} sx={{ mb: 3 }}>
					<Typography
						variant="subtitle1"
						sx={{
							fontWeight: 600,
							mb: 1,
							color: groupName === toolname ? "secondary.main" : "primary.main",
							cursor: groupModule ? "context-menu" : "default",
							userSelect: "none",
							"&:hover": {
								backgroundColor: groupModule ? "rgba(0, 0, 0, 0.04)" : "transparent",
							},
							px: 1,
							py: 0.5,
							borderRadius: 1,
						}}
						onContextMenu={groupModule ? (event) => handleContextMenu(event, groupModule) : undefined}
					>
						{groupName === toolname ? <MouskaTool height={"20px"} /> : <></>}
						{groupName}
						{currentParams[qKey] && `(${modules.length + utilities.length})`}
					</Typography>
					<Typography variant="caption">
						{groupName === toolname ? tooldescription : groupModule?.DESCRIPTION}
					</Typography>
					{modules.length > 0 && renderModuleList(modules)}
					{utilities.length > 0 && renderUtilityList(utilities)}
					{groupIndex < groupEntries.length - 1 && <Divider sx={{ my: 2 }} />}
				</Box>
			);
		});
	}, [groupedResults, currentParams, renderModuleList, renderUtilityList, handleContextMenu]);

	const hasSearchTerm = Boolean(currentParams[qKey]);
	const resultCount = searchResults.length;
	const isBookmarkSearch =
		hasSearchTerm &&
		(currentParams[qKey]?.toLowerCase() === "bookmarked" || currentParams[qKey]?.toLowerCase() === "bookmark");

	return (
		<>
			<ResponsiveDialog
				open={openDialogCreate}
				onClose={onClose}
				dialogProps={{ maxWidth: "md", fullWidth: true }}
			>
				<DialogTitle sx={{ pb: 1 }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
						<FinderIcon size={24} weight="fill" />
						<Typography variant="h6">{finderTitle} - Finder</Typography>
					</Box>
					<SearchField
						tooltip="Search for modules here"
						label={finderTitle}
						autoComplete="off"
						startIcon={<FinderIcon weight="fill" fontWeight={900} />}
						ref={searchFieldRef}
						placeholder={finderSubTitle}
						size="small"
						qKey={qKey}
						fullWidth
					/>
					<Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
						{finderTitle}
						{finderDescription}
						<Box component={"span"} color={"green"}>
							🐄෴🐓෴🐖
						</Box>
					</Typography>
				</DialogTitle>

				<DialogContent sx={{ pt: 1 }}>
					{!hasSearchTerm ? (
						<Box>{renderGroupedModules()}</Box>
					) : (
						<Box>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
								{isBookmarkSearch
									? `Found ${resultCount} result${
											resultCount !== 1 ? "s" : ""
									  } (bookmarked modules + text matches)`
									: `Found ${resultCount} result${resultCount !== 1 ? "s" : ""} for "${
											currentParams[qKey]
									  }"`}
							</Typography>
							{Object.keys(groupedResults).length === 0 ? (
								<Box sx={{ textAlign: "center", py: 4 }}>
									<Typography
										color="primary"
										sx={{
											svg: {
												path: { stroke: "var(--mui-palette-text-primary)" },
												line: {
													stroke: "var(--mui-palette-text-primary)",
												},
											},
										}}
									>
										<DeadCow height={100} />
									</Typography>
									<Typography variant="body1" color="text.secondary">
										{isBookmarkSearch
											? "No bookmarked modules or text matches found."
											: "No moooo-dules found matching your search."}
									</Typography>
									<Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
										{isBookmarkSearch
											? "Start bookmarking modules or try a different search term."
											: "The cow is dead. Try different keywords or browse all modules above."}
									</Typography>
								</Box>
							) : (
								renderGroupedModules()
							)}
						</Box>
					)}
				</DialogContent>
				<Divider />
				<DialogActions>
					<Typography
						variant="caption"
						color="text.disabled"
						sx={{ mr: "auto", display: "flex", alignItems: "center", gap: 1 }}
					>
						Press Enter or click to navigate to a module, or right click (<MouseRightClick weight="fill" />)
						a module to show context{isBookmarkSearch && " • Showing bookmarked + matching items"}
					</Typography>
				</DialogActions>
			</ResponsiveDialog>
			<ContextMenu contextMenu={contextMenu} menuItems={getMenuItemsForModule} onClose={handleCloseContextMenu} />
		</>
	);
};

export default FinderDialog;
