import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { ReactNode } from "react";

interface DialogTitleActionsProps {
	children: ReactNode;
}

// Styled component for the title actions area
const StyledTitleActions = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: theme.spacing(1),
}));

// Component that renders actions in the dialog title area
export const DialogTitleActions = ({ children }: DialogTitleActionsProps) => {
	return <StyledTitleActions className="dialog-title-actions">{children}</StyledTitleActions>;
};
