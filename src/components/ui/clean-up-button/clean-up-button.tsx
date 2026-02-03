// import Box from "@mui/material/Box";
// import { ButtonProps } from "@mui/material/Button";
// import IconButton from "@mui/material/IconButton";
// import { Broom, Warning } from "@phosphor-icons/react";
// import { isEmpty } from "lodash";
// import { enqueueSnackbar } from "notistack";
// import { forwardRef, useImperativeHandle, useRef } from "react";
// import { useHotkeys } from "react-hotkeys-hook";
// import { usePageParams } from "../../../hooks/usePageParams";
// import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
// import { formatShortcut } from "../../../utils/formatShortcut";
// import ContextMenu, { ContextMenuItem } from "../context-menu/context-menu";
// import useContextMenu from "../context-menu/useContextMenu";
// import CoolTip from "../cool-tip/cool-tip";

// export interface CleanUpButtonRef {
// 	clearParams: () => void;
// 	element: HTMLButtonElement | null;
// }

// interface CleanUpButtonProps extends ButtonProps {}

// export const clearShortcut = "ctrl+alt+z";

// const CleanUpButtonComponent = (props: CleanUpButtonProps, ref: React.Ref<CleanUpButtonRef>) => {
// 	const buttonRef = useRef<HTMLButtonElement>(null);
// 	const { contextMenu, handleContextMenu, handleCloseContextMenu } = useContextMenu();
// 	const { currentParams } = useRememberQueryParams();
// 	const { reset, clearParams } = usePageParams({ defaultParams: {} });

// 	const handleClearParams = () => {
// 		enqueueSnackbar("All query parameters cleared", { variant: "success" });
// 		reset();
// 		clearParams();
// 	};

// 	useImperativeHandle(ref, () => ({
// 		clearParams: handleClearParams,
// 		element: buttonRef.current,
// 	}));

// 	useHotkeys(
// 		clearShortcut,
// 		(e: KeyboardEvent) => {
// 			e.preventDefault();
// 			e.stopPropagation();
// 			console.log("Hotkey triggered!"); // Debug log
// 			handleClearParams();
// 		},
// 		{
// 			preventDefault: true,
// 			enableOnFormTags: true, // Allow hotkey to work even when form elements are focused
// 			enableOnContentEditable: true,
// 		},
// 		[handleClearParams] // Dependencies go here as the 4th parameter
// 	);

// 	const getRightClickMenuItems = (): Array<ContextMenuItem<unknown>> => [
// 		{
// 			id: `cleanParams`,
// 			label: "Clean my params",
// 			icon: <Warning height={20} width={"auto"} color="var(--error-main)" />,
// 			onClick: handleClearParams,
// 		},
// 	];

// 	return (
// 		<>
// 			<CoolTip title={`Cleans up all parameters (${formatShortcut(clearShortcut)})`}>
// 				<Box>
// 					<IconButton
// 						ref={buttonRef}
// 						size="small"
// 						disabled={isEmpty(currentParams)}
// 						{...props}
// 						onClick={(event) => handleContextMenu(event, getRightClickMenuItems())}
// 						onContextMenu={(event) => handleContextMenu(event, getRightClickMenuItems())}
// 					>
// 						<Broom
// 							weight={isEmpty(currentParams) ? "bold" : "fill"}
// 							color={isEmpty(currentParams) ? undefined : "var(--success-main)"}
// 						/>
// 					</IconButton>
// 				</Box>
// 			</CoolTip>
// 			<ContextMenu
// 				contextMenu={contextMenu}
// 				menuItems={getRightClickMenuItems}
// 				onClose={handleCloseContextMenu}
// 				slotProps={{}}
// 			/>
// 		</>
// 	);
// };

// const CleanUpButton = forwardRef<CleanUpButtonRef, CleanUpButtonProps>(CleanUpButtonComponent);

// CleanUpButton.displayName = "CleanUpButton";

// export default CleanUpButton;
