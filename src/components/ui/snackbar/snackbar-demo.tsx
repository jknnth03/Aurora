import React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useSnackbar, VariantType } from "notistack";

// Example component showing how to use the snackbars
export const SnackbarDemo: React.FC = () => {
	const { enqueueSnackbar } = useSnackbar();

	// Function to show different snackbar variants
	const showSnackbar = (variant: VariantType): void => {
		const messages: Record<VariantType, string> = {
			default:
				"Hi There! You need to use this package in the app to uplift your Snackbar Experience! Sunt adipisicing aute magna deserunt excepteur dolor eu est do ipsum veniam commodo id.",
			success: "Congratulations! You have successfully read this message. Please continue working!",
			error: "On Snap! You have failed to read this failure message. Please try again!",
			warning: "Warning! You have a warning for this message. Please read carefully!",
			info: "Info: This is an informational message.",
		};

		enqueueSnackbar(messages[variant], { variant });
	};

	return (
		<Stack spacing={2} sx={{ p: 4 }}>
			<Typography variant="h5" gutterBottom>
				Custom Snackbar Demo
			</Typography>

			<Stack direction="row" spacing={2}>
				<Button variant="contained" color="primary" onClick={() => showSnackbar("default")}>
					Default Snackbar
				</Button>

				<Button variant="contained" color="success" onClick={() => showSnackbar("success")}>
					Success Snackbar
				</Button>

				<Button variant="contained" color="error" onClick={() => showSnackbar("error")}>
					Error Snackbar
				</Button>

				<Button variant="contained" color="warning" onClick={() => showSnackbar("warning")}>
					Warning Snackbar
				</Button>

				<Button variant="contained" color="info" onClick={() => showSnackbar("info")}>
					Info Snackbar
				</Button>
			</Stack>
		</Stack>
	);
};
