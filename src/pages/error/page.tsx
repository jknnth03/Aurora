import { isRouteErrorResponse, Link, useNavigate, useRouteError } from "react-router";

import HomeRounded from "@mui/icons-material/HomeRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Zero from "../../assets/Aurora0.svg"; // Import the same Zero SVG used in NotFound page
import "./index.scss";

const ErrorPage = () => {
	const errors = useRouteError();
	const navigate = useNavigate();
	const getErrorDetails = () => {
		if (isRouteErrorResponse(errors)) {
			return {
				status: errors.status,
				statusText: errors.statusText,
				message: errors.data,
			};
		} else if (errors instanceof Error) {
			// This is a JavaScript error
			return {
				status: 500,
				statusText: "Internal Error",
				message: errors.message,
			};
		} else if (typeof errors === "string") {
			// This is a string error
			return {
				status: 500,
				statusText: "Error",
				message: errors,
			};
		} else {
			// Unknown error types
			return {
				status: 500,
				statusText: "Unknown Error",
				message: "An unknown error occurred",
			};
		}
	};

	const errorDetails = getErrorDetails();

	return (
		<Box className="error-page">
			<Box className="error-page__content">
				<Box className="error-page__message-container">
					<Box className="error-page__oops-text">
						<img src={Zero} alt="o" className="error-page__text-o error-page__text-o--1 animate" />
						<img src={Zero} alt="o" className="error-page__text-o error-page__text-o--2 animate" />
						<span className="error-page__text-element error-page__text-element--ps animate">ps!</span>
					</Box>

					<h2 className="error-page__status animate">
						{errorDetails.status} {errorDetails.statusText}
					</h2>
					<p className="error-page__message animate">{errorDetails.message}</p>
					<p className="error-page__description animate">Sorry, an unexpected error has occurred.</p>
				</Box>

				<Button
					onClick={() => {
						navigate(-1);
					}}
					startIcon={<HomeRounded />}
					variant="contained"
					color="primary"
					className="error-page__button animate"
				>
					Back to Homepage
				</Button>
			</Box>
		</Box>
	);
};

export default ErrorPage;
