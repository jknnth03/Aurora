import Tab from "@mui/material/Tab";
import { useNavigate } from "react-router";

interface LinkTabProps {
	label?: string;
	href?: string;
	selected?: boolean;
}

export default function LinkTab(props: LinkTabProps) {
	const navigate = useNavigate();

	return (
		<Tab
			component="a"
			onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
				// Routing libraries handle this, you can remove the onClick handle when using them.
				if (props?.href) {
					navigate(props.href);
				}
			}}
			aria-current={props.selected && "page"}
			{...props}
		/>
	);
}
