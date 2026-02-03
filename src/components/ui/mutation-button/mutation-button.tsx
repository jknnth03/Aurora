import Button, { ButtonProps } from "@mui/material/Button";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ongoingMutation } from "../../../features/slices/auth-slice";

const MutateButton = (props: ButtonProps) => {
	const mutation = useSelector(ongoingMutation);

	const isLoading = useMemo(() => Object.entries(mutation)?.[0]?.[1]?.status === "pending", [mutation]);

	return (
		<Button loading={isLoading} {...props}>
			{props.children}
		</Button>
	);
};

export default MutateButton;
