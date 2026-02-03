import { SnackbarKey, useSnackbar } from "notistack";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Close from "@mui/icons-material/Close";
import useCountdownTimer from "../../../hooks/useCountdownTimer";
import Box from "@mui/material/Box";
import "./snackbar.scss";
interface DismissedActionProps extends Omit<IconButtonProps, "id"> {
	id: SnackbarKey;
	autoHideDurationInMs: number;
}

const DismissedAction = ({ id, autoHideDurationInMs, ...props }: DismissedActionProps) => {
	const { closeSnackbar } = useSnackbar();

	// Use our custom hook with all functionality
	const { progress, isPaused, pause, resume, reset } = useCountdownTimer(autoHideDurationInMs, () =>
		closeSnackbar(id)
	);
	const handleClose = () => {
		closeSnackbar(id);
	};

	// You could add a reset button or function that uses the reset capability
	// For example, you could add this to reset the timer:
	const handleReset = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent triggering the close action
		reset();
	};

	return (
		<Box className="dismissed-action" onMouseEnter={pause} onMouseLeave={resume}>
			<IconButton
				onClick={handleClose}
				size="small"
				disableFocusRipple
				disableRipple
				disableTouchRipple
				color="inherit"
				className="dismissed-action__icon-btn"
				{...props}
			>
				<CircularProgress
					variant="determinate"
					value={progress}
					size={24}
					thickness={2.5}
					className="dismissed-action__circle-progress"
					onDoubleClick={handleReset}
				/>
				<Close className="dismissed-action__close-icon" fontSize="small" color="inherit" />
			</IconButton>
		</Box>
	);
};

export default DismissedAction;
