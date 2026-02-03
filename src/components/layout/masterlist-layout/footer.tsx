import Box from "@mui/material/Box";
import AuroraSpinner from "../../ui/aurora-spinner/aurora-spinner";
import CleanUpButton from "../../ui/clean-up-button/clean-up-button";
import "./footer.scss";
import ProcessMarker from "../../ui/process-marker/process-marker";
import NetworkStatusIndicator from "../../ui/network-status-marker/network-status-marker";
import LightDarkModeSwitch from "../../ui/light-dark-mode-switch/light-dark-mode-toggle";
import Divider from "@mui/material/Divider";

const Footer = () => {
	return (
		<Box className="footer">
			{/* <ModeSwitch size="xxxs" />
			<CleanUpButton />
			<Box height={"100%"}>
				<Divider orientation="vertical" />
			</Box>
			<ProcessMarker />
			<NetworkStatusIndicator /> */}
		</Box>
	);
};

export default Footer;
