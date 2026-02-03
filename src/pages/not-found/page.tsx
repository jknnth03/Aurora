import { useNavigate } from "react-router";
import Zero from "../../assets/Aurora0.svg";
import Four from "../../assets/Aurora4.svg";
import "./style.scss";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import HomeRounded from "@mui/icons-material/HomeRounded";
import { MODULES } from "../../config/modules/modules";
const NotFound = () => {
	const navigate = useNavigate();

	const handleGoHome = () => {
		navigate(MODULES.DASHBOARD.PATH);
	};

	return (
		<Box className="not-found-page">
			<Box className="not-found-page__content">
				<Box className="not-found-page__404">
					<Box className="svg-container svg-container--four1 animate">
						<img
							src={Four}
							className="not-found-page__svg not-found-page__svg--four"
							alt="4"
							width="200"
							height="240"
						/>
					</Box>
					<Box className="svg-container svg-container--zero animate">
						<img
							src={Zero}
							className="not-found-page__svg not-found-page__svg--zero"
							alt="0"
							width="200"
							height="240"
						/>
					</Box>
					<Box className="svg-container svg-container--four2 animate">
						<img
							src={Four}
							className="not-found-page__svg not-found-page__svg--four"
							alt="4"
							width="200"
							height="240"
						/>
					</Box>
				</Box>

				<Box className="not-found-page__message-container">
					<img
						src={Zero}
						alt="o"
						className="not-found-page__text-element not-found-page__text-o not-found-page__text-o--1 animate"
					/>
					<img
						src={Zero}
						alt="o"
						className="not-found-page__text-element not-found-page__text-o not-found-page__text-o--2 animate"
					/>
					<span className="not-found-page__text-element not-found-page__text-element--ps animate">ps!</span>
					<span className="not-found-page__text-element not-found-page__text-element--page animate">
						Page not found
					</span>
				</Box>

				<Button
					startIcon={<HomeRounded />}
					variant="contained"
					color="primary"
					className="not-found-page__button animate"
					onClick={handleGoHome}
				>
					Go Home
				</Button>
			</Box>
		</Box>
	);
};

export default NotFound;
