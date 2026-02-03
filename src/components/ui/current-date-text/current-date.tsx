import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import moment from "moment";
import useLiveDateTime from "../../../hooks/useLiveDateTime";
import CoolTip from "../cool-tip/cool-tip";

const CurrentDate = ({ dateFormat = "ddd MMM DD hh:mm " }: { dateFormat?: string }) => {
	const { getCurrentDate } = useLiveDateTime({ granularity: "minutes" });
	const theme = useTheme();
	const isTabletMode = useMediaQuery(theme.breakpoints.down("md"));
	const currentDate = moment(getCurrentDate()).format(isTabletMode ? "MM-DD hh:mm" : dateFormat);

	return (
		<CoolTip title={`Today is ${moment(getCurrentDate()).format("LLLL")}`}>
			<Typography variant="caption" lineHeight={2} minWidth={80} sx={{ display: "flex", alignItems: "center" }}>
				{currentDate}
			</Typography>
		</CoolTip>
	);
};

export default CurrentDate;
