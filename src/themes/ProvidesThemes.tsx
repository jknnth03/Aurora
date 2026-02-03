import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Zoom from "@mui/material/Zoom";
import { CheckSquare, Circle, IconContext, RadioButton, Square } from "@phosphor-icons/react";
import { ReactNode } from "react";
import SnackProvider from "../components/ui/snackbar/snackbar";
import usePaletteTheme from "../hooks/useTheme";
import breakpoints from "../styles/__breakpoints.module.scss";
import AuroraSpinner from "../components/ui/aurora-spinner/aurora-spinner";

const bpoints = {
	xs: parseFloat(breakpoints.xs),
	sm: parseFloat(breakpoints.sm),
	md: parseFloat(breakpoints.md),
	lg: parseFloat(breakpoints.lg),
	xl: parseFloat(breakpoints.xl),
};

const commonRadius = 10;

const ProvidesTheme = ({ children }: { children: ReactNode }) => {
	const { colors, mode, colorList } = usePaletteTheme();

	useMediaQuery("(prefers-color-scheme: dark)", {
		noSsr: true,
		defaultMatches: mode === "dark",
	});

	const theme = createTheme({
		cssVariables: true,
		typography: {
			fontFamily: ["Poppins", "Nunito", "Roboto", '"Helvetica Neue"', "Arial", "sans-serif"].join(","),
		},
		shape: {
			borderRadius: commonRadius,
		},
		palette: {
			mode: mode,
			...colors,
			background: {
				default: colors?.background?.main ?? "#ffff",
				paper: colors?.background?.light,
			},
			text: {
				primary: colors.text.main,
			},
		},
		breakpoints: {
			values: bpoints,
		},
		components: {
			MuiOutlinedInput: {
				styleOverrides: {
					root: {
						borderRadius: commonRadius,
					},
				},
			},
			MuiCheckbox: {
				defaultProps: {
					icon: <Square size={20} weight="bold" />,
					checkedIcon: <CheckSquare size={20} weight="fill" color={colors.primary.main} />,
				},
			},
			MuiRadio: {
				defaultProps: {
					icon: <Circle size={20} />,
					checkedIcon: <RadioButton size={20} weight="fill" color={colors.primary.main} />,
				},
			},
			MuiMenu: {
				defaultProps: {
					elevation: 0,
				},
			},
			MuiPaper: {
				defaultProps: {
					elevation: 0,
				},
				styleOverrides: {
					root: {
						border: " 1px solid var(--mui-palette-divider)",
						borderRadius: commonRadius,
						backgroundImage: "none",
						backgroundColor: colors.background.light,
						transition: "background-color 0.3s",
					},
				},
			},
			MuiButton: {
				defaultProps: {
					loadingIndicator: <AuroraSpinner size={14} />,
				},
				styleOverrides: {
					root: {
						borderRadius: commonRadius,
					},
				},
			},
			MuiTabs: {
				styleOverrides: {
					root: {
						// backgroundColor: "var(--tertiary-main)",
						borderRadius: commonRadius,
					},
					indicator: {
						minHeight: "35px",
						// maxWidth: 10,
						zIndex: -1,
						borderRadius: commonRadius,
					},
				},
			},
			MuiTab: {
				styleOverrides: {
					root: {
						"&.Mui-selected": {
							color: colors.primary.contrastText,
						},
					},
				},
			},
			MuiTableHead: {
				styleOverrides: {
					root: {
						"& .MuiTableCell-root": {
							backgroundColor: undefined,
							color: colors.primary.contrastText,
						},
					},
				},
			},

			MuiTooltip: {
				styleOverrides: {
					tooltip: ({ theme, ownerState }) => {
						const transparency = ownerState.transparent === true ? 0.8 : 1;

						// Variant color mapping
						const variantColors = {
							primary: {
								bg: colors.secondary.main,
								text: colors.secondary.contrastText,
							},
							error: {
								bg: colors.error.main,
								text: colors.error.contrastText,
							},
							success: {
								bg: colors.success.main,
								text: colors.success.contrastText,
							},
							warning: {
								bg: colors.warning.main,
								text: colors.warning.contrastText,
							},
							info: {
								bg: colors?.info?.main ?? colors.secondary.main,
								text: colors?.info?.contrastText ?? colors.secondary.contrastText,
							},
						};

						const variant = ownerState.variant || "primary";
						const colorSet = variantColors[variant] || variantColors.primary;

						return {
							backgroundColor: alpha(colorSet.bg, transparency),
							color: colorSet.text,
							borderRadius: commonRadius,
						};
					},

					arrow: ({ theme, ownerState }) => {
						const transparency = ownerState.transparent === true ? 0.8 : 1;

						// Variant color mapping for arrow
						const variantColors = {
							primary: colors.primary.main,
							error: colors.error.main,
							success: colors.success.main,
							warning: colors.warning.main,
							info: colors?.info?.main ?? colors?.secondary?.main,
						};

						const arrowColor = variantColors.primary;

						return {
							color: "transparent", // Hide the default arrow
							minWidth: "16px", // Wider container for the circle
							minHeight: "16px", // Taller container for the circle
							"&::before": {
								content: '""',
								position: "absolute",
								width: "10px", // Circle diameter
								height: "10px", // Circle diameter
								borderRadius: "50%", // Make it circular
								backgroundColor: alpha(arrowColor, transparency),
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								boxShadow: `0 0 2px ${alpha("#000", 0.2)}`,
							},
						};
					},
					// Adjust spacing for the circular arrow
					popper: ({ ownerState }) => {
						if (!ownerState.arrow) return {};

						return {
							'&[data-popper-placement*="bottom"]': { marginTop: "6px" },
							'&[data-popper-placement*="top"]': { marginBottom: "6px" },
							'&[data-popper-placement*="left"]': { marginRight: "6px" },
							'&[data-popper-placement*="right"]': { marginLeft: "6px" },
						};
					},
				},
				defaultProps: {
					slots: { transition: Zoom },
					arrow: true,
					// transparent: true,
					variant: "primary",
				},
			},
		},
	});

	return (
		<ThemeProvider theme={theme}>
			<IconContext.Provider
				value={{
					color: alpha(colors.text.main, 0.7),
					size: theme.typography.fontSize + 3,
					weight: "bold",
					mirrored: false,
				}}
			>
				<CssBaseline />
				<GlobalStyles
					styles={{
						body: {
							backgroundColor: colors.background.main,
							transition: "background-color 0.3s, color 0.3s",
						},
					}}
				/>
				<SnackProvider>
					{/* Trigger kapag mag sstyle kana ng snackbar */}
					{/* <SnackbarDemo /> */}

					{children}
				</SnackProvider>
			</IconContext.Provider>
		</ThemeProvider>
	);
};
export default ProvidesTheme;
