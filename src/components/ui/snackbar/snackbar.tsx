import { alpha, styled } from "@mui/material/styles";
import { Alien, Bomb, CrownSimple, HandWaving, Star } from "@phosphor-icons/react";
import { MaterialDesignContent, SnackbarProvider } from "notistack";
import { ReactNode, useRef } from "react";
import DismissedAction from "./dismiss-action";
import "./snackbar.scss"; // Import the SCSS file

const alphaValue = 1;
const autoHideDurationInMs = 8000; //ms

const SnackProvider = ({ children }: { children: ReactNode }) => {
	const notistackRef = useRef<SnackbarProvider | null>(null);

	const StyledSnack = styled(MaterialDesignContent)(({ theme }) => {
		return {
			borderRadius: theme.shape.borderRadius,
			paddingRight: 30,

			"&.notistack-MuiContent-default": {
				color: theme.palette.primary.contrastText,
				backgroundColor: alpha(theme.palette.primary.light, alphaValue),
			},
			"&.notistack-MuiContent-success": {
				color: theme.palette.success.contrastText,
				backgroundColor: alpha(theme.palette.success.light, alphaValue),
			},
			"&.notistack-MuiContent-error": {
				color: theme.palette.error.contrastText,
				backgroundColor: alpha(theme.palette.error.light, alphaValue),
			},
			"&.notistack-MuiContent-warning": {
				color: theme.palette.warning.contrastText,
				backgroundColor: alpha(theme.palette.warning.light, alphaValue),
			},
			"&.notistack-MuiContent-info": {
				color: theme.palette.info.contrastText,
				backgroundColor: alpha(theme.palette.info.light, alphaValue),
			},
		};
	});

	return (
		<SnackbarProvider
			ref={notistackRef}
			autoHideDuration={autoHideDurationInMs}
			anchorOrigin={{
				vertical: "bottom",
				horizontal: "right",
			}}
			maxSnack={10}
			iconVariant={{
				default: <Star weight="fill" color="var(--secondary-main)" className="snack-icon primary-icon" />,
				success: (
					<CrownSimple weight="fill" color="var(--secondary-main)" className="snack-icon success-icon" />
				),
				error: <Bomb weight="fill" color="var(--secondary-main)" className="snack-icon error-icon" />,
				info: <HandWaving weight="fill" color="var(--secondary-main)" className="snack-icon info-icon" />,
				warning: <Alien weight="fill" color="var(--secondary-main)" className="snack-icon warning-icon" />,
			}}
			action={(key) => <DismissedAction id={key} autoHideDurationInMs={autoHideDurationInMs} />}
			Components={{
				success: StyledSnack,
				error: StyledSnack,
				default: StyledSnack,
				warning: StyledSnack,
				info: StyledSnack,
			}}
			preventDuplicate={true}
		>
			{children}
		</SnackbarProvider>
	);
};

export default SnackProvider;
