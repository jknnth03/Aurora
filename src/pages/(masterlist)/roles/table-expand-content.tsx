import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ListChecks, ShieldStar } from "@phosphor-icons/react";
import { Role } from "../../../features/api/aurora/masterlist/role.api";
import usePermission from "../../../hooks/usePermission";
import { PermissionOption } from "./role-form";
import React, { useMemo } from "react";
import { MODULES } from "../../../config/modules/modules";

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

const ModuleLabel = styled(Typography)(({ theme }) => ({
	fontWeight: 600,
	color: theme.palette.text.primary,
	marginTop: theme.spacing(2),
	marginBottom: theme.spacing(1),
	fontSize: "0.9rem",
}));

const PermissionChip = styled(Chip)(({ theme }) => ({
	margin: theme.spacing(0.5),
	textTransform: "capitalize",
}));

const ExpandedContent = ({ role }: { role: Role }) => {
	const permissionOptions = useMemo<PermissionOption[]>(() => {
		const options: PermissionOption[] = [];

		// Process all top-level modules
		Object.entries(MODULES).forEach(([moduleKey, module]) => {
			const moduleName = module.ALIAS;

			// If module has children, add them as permissions
			if (module.CHILDREN && Object.keys(module.CHILDREN).length > 0) {
				Object.values(module.CHILDREN).forEach((childModule) => {
					if (childModule.KEY) {
						options.push({
							KEY: childModule.KEY,
							ALIAS: childModule.ALIAS,
							MODULE: moduleName,
							ICON: childModule.ICON,
							ICON_ON: childModule.ICON_ON,
							PATH: childModule.PATH,
						});
					}
				});
			}
			// If module has no children, add the module itself as a permission
			else if (module.KEY) {
				options.push({
					KEY: module.KEY,
					ALIAS: module.ALIAS,
					MODULE: "Main Modules",
					ICON: module.ICON,
					ICON_ON: module.ICON_ON,
					PATH: module.PATH,
				});
			}
		});

		return options;
	}, []);

	const permissionsByModule = useMemo(() => {
		const grouped: Record<string, PermissionOption[]> = {};

		permissionOptions.forEach((option) => {
			if (!grouped[option.MODULE]) {
				grouped[option.MODULE] = [];
			}
			grouped[option.MODULE].push(option);
		});

		// Sort the modules to ensure "Main Modules" appears first
		return Object.entries(grouped)
			.sort(([a], [b]) => {
				if (a === "Main Modules") return -1;
				if (b === "Main Modules") return 1;
				return a.localeCompare(b);
			})
			.reduce((acc, [key, value]) => {
				acc[key] = value;
				return acc;
			}, {} as Record<string, PermissionOption[]>);
	}, [permissionOptions]);

	// Filter selected permissions by module
	const selectedPermissionsByModule = useMemo(() => {
		const result: Record<string, PermissionOption[]> = {};

		Object.entries(permissionsByModule).forEach(([moduleName, permissions]) => {
			const selectedInModule = permissions.filter((permission) =>
				role.access_permission.includes(permission.KEY)
			);

			if (selectedInModule.length > 0) {
				result[moduleName] = selectedInModule;
			}
		});

		return result;
	}, [permissionsByModule, role.access_permission]);

	// Get permissions that don't belong to any module (like "Viewing Only")
	const unCategorizedPermissions = useMemo(() => {
		const allModulePermissions = Object.values(permissionsByModule)
			.flat()
			.map((p) => p.KEY);

		return role.access_permission.filter((permission) => !allModulePermissions.includes(permission));
	}, [permissionsByModule, role.access_permission]);

	const formatPermission = (permission: string) => {
		return permission.replace(/_/g, " ");
	};

	return (
		<Box>
			<Grid>
				{/* Permissions Information */}
				<Grid size={12}>
					<StyledPaper>
						<SectionTitle variant="h6" textTransform={"capitalize"}>
							<ShieldStar size={20} weight="bold" />
							{role.name}
						</SectionTitle>

						<Grid container spacing={2}>
							<Grid size={{ xs: 12, md: 8 }}>
								<Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
									<ListChecks size={20} style={{ marginRight: "8px", marginTop: "2px" }} />
									<Label variant="body2">Permissions:</Label>
								</Box>

								<Box sx={{ pl: 4 }}>
									{/* Display uncategorized permissions first (like "Viewing Only") */}
									{unCategorizedPermissions.length > 0 && (
										<Box sx={{ mb: 2 }}>
											<ModuleLabel variant="subtitle2">General Permissions</ModuleLabel>
											<Box sx={{ display: "flex", flexWrap: "wrap" }}>
												{unCategorizedPermissions.map((permission, index) => (
													<PermissionChip
														key={index}
														label={formatPermission(permission)}
														size="small"
														variant="outlined"
														color="secondary"
													/>
												))}
											</Box>
										</Box>
									)}

									{/* Display permissions grouped by module */}
									{Object.entries(selectedPermissionsByModule).map(([moduleName, permissions]) => (
										<Box key={moduleName} sx={{ mb: 2 }}>
											<ModuleLabel variant="subtitle2">{moduleName}</ModuleLabel>
											<Box sx={{ display: "flex", flexWrap: "wrap" }}>
												{permissions.map((permission, index) => {
													return (
														<PermissionChip
															key={index}
															icon={
																React.isValidElement(permission.ICON_ON)
																	? permission.ICON_ON
																	: undefined
															}
															label={formatPermission(permission.ALIAS)}
															size="small"
															variant="outlined"
															color="primary"
														/>
													);
												})}
											</Box>
										</Box>
									))}
								</Box>
							</Grid>
						</Grid>
					</StyledPaper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default ExpandedContent;
