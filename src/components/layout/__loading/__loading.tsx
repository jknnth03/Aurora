import Box from "@mui/material/Box";
import AuroraSpinner from "../../ui/aurora-spinner/aurora-spinner";

const PageLoad = () => {
	return (
		<Box
			position={"absolute"}
			top={0}
			left={0}
			height={"100vh"}
			width={"100vw"}
			display="flex"
			justifyContent="center"
			alignItems="center"
			sx={{ backdropFilter: "blur(10px)" }}
		>
			<Box>
				<AuroraSpinner />
			</Box>
		</Box>
	);
};

export default PageLoad;
