// src/pages/Unauthorized.tsx
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React from "react";
import { useNavigate } from "react-router";
import { CONFIG } from "../../config/config";

const UnauthorizedPage: React.FC = () => {
	const navigate = useNavigate();

	return (
		<Container maxWidth="sm">
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "80vh",
					textAlign: "center",
				}}
			>
				<Typography variant="h1" component="h1" gutterBottom>
					403
				</Typography>
				<Typography variant="h5" component="h2" gutterBottom>
					Unauthorized Access
				</Typography>
				<Typography variant="body1" sx={{ mb: 4 }}>
					You don't have permission to access this page.
				</Typography>
				<Box sx={{ display: "flex", gap: 2 }}>
					<Button variant="contained" color="primary" onClick={() => navigate(CONFIG.ROUTES.DASHBOARD.PATH)}>
						Go to Dashboard
					</Button>
					<Button variant="outlined" onClick={() => navigate(-1)}>
						Go Back
					</Button>
				</Box>
			</Box>
		</Container>
	);
};

export default UnauthorizedPage;
