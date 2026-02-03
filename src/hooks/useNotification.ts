import { useSnackbar, VariantType, OptionsObject } from "notistack";

/**
 * Custom hook for using notifications throughout the application
 */
export const useNotification = () => {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	/**
	 * Show a notification
	 * @param message - The message to display
	 * @param variant - The type of notification (success, error, warning, info)
	 * @param options - Additional notistack options
	 */
	const showNotification = (message: string, variant: VariantType = "default", options?: OptionsObject) => {
		return enqueueSnackbar(message, {
			variant,
			autoHideDuration: variant === "error" ? 6000 : 3000,
			...options,
		});
	};

	/**
	 * Show a success notification
	 * @param message - The message to display
	 * @param options - Additional notistack options
	 */
	const showSuccess = (message: string, options?: OptionsObject) => {
		return showNotification(message, "success", options);
	};

	/**
	 * Show an error notification
	 * @param message - The message to display
	 * @param options - Additional notistack options
	 */
	const showError = (message: string, options?: OptionsObject) => {
		return showNotification(message, "error", options);
	};

	/**
	 * Show a warning notification
	 * @param message - The message to display
	 * @param options - Additional notistack options
	 */
	const showWarning = (message: string, options?: OptionsObject) => {
		return showNotification(message, "warning", options);
	};

	/**
	 * Show an info notification
	 * @param message - The message to display
	 * @param options - Additional notistack options
	 */
	const showInfo = (message: string, options?: OptionsObject) => {
		return showNotification(message, "info", options);
	};

	return {
		showNotification,
		showSuccess,
		showError,
		showWarning,
		showInfo,
		closeSnackbar,
	};
};

export default useNotification;
