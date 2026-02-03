import Box from "@mui/material/Box";
import { color } from "../../../types/theme-types";

interface AuroraSpinnerProps {
	size?: number;
	duration?: number;
	distance?: number;
	primaryColor?: color;
	secondaryColor?: color;
}

const AuroraSpinner = ({
	size = 96,
	duration = 0.5,
	distance = 45,
	primaryColor = "#ffc936",
	secondaryColor = "#f37925",
}: AuroraSpinnerProps) => {
	return (
		<Box
			className="spinner-container"
			sx={{
				height: "100%",
				width: "100%",
				display: "flex",
				alignContent: "center",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 590.63 614.66"
				width={size}
				height={size}
				overflow={"visible"}
			>
				<style>
					{`
					
			.spinner-container {
					display:flex;
					width:100%;
					height:100%;
					overflow:visible;
			}
            @keyframes floatTriangle {
              0% { transform: translateY(0); }
              50% { transform: translateY(-${distance}px); }
              100% { transform: translateY(0); }
            }
            .triangle-float {
              animation: floatTriangle ${duration}s ease-in-out infinite;
              transform-origin: center;
              transform-box: fill-box;
            }
          `}
				</style>
				{/* Main part */}
				<path
					fill={primaryColor}
					d="M428.9,230.64l24.41,48.45h0l4.2,8.34,14.77,29.34L585.7,541.89a46,46,0,0,1-20.33,61.77h0A46,46,0,0,1,503.5,583.3L397.53,373,91.35,603.2a57,57,0,0,1-59.95,5.36h0A57,57,0,0,1,6.11,532L205.8,135.44,144.47,438.22,428.9,230.64"
				/>
				{/* Triangle with animation */}
				<path
					fill={secondaryColor}
					className="triangle-float"
					d="M332,179L277.51,0l-86,369.1v0L411.8,206.31Zm-49.54-36.79,20.44,65.14,31.78,10.88-85.07,62.86Z"
				/>
			</svg>
		</Box>
	);
};

export default AuroraSpinner;
