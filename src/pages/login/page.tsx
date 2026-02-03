import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect, useMemo, useState } from "react";
import logo from "../../assets/aurora.svg"; // Import the logo directly
import Diagonals from "../../assets/diagonals.svg?react"; // Import the diagonals directly
import loginImage from "../../assets/login-illustration.png"; // Import the image directly
import AuroraSpinner from "../../components/ui/aurora-spinner/aurora-spinner";
import LazyImage from "../../components/ui/lazy-image";
import { CONFIG } from "../../config/config";
import LoginForm from "./components/LoginForm";
import "./index.scss";
// import PatchMarker from "../../components/ui/patch-marker/patch-marker";

const LoginPage = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [imageLoaded, setImageLoaded] = useState(false);

  // Lazy load the image
  useEffect(() => {
    const img = new Image();
    img.src = loginImage; // Replace with your actual image path
    img.onload = () => {
      setImageLoaded(true);
    };
  }, []);

  return (
    <Box className="login">
      <Grid container spacing={0} className="login__grid">
        {!isMobile && (
          <Grid size={{ xs: 12, md: 5 }} className="login__image-container">
            <Box className="login__image-wrapper">
              {imageLoaded ? (
                <>
                  <LazyImage
                    className="login__image"
                    src={loginImage}
                    alt="Login illustration"
                  />
                  {/* <img
										src={loginImage}
										alt="Login illustration"
										className="login__image"
										loading="lazy"
									/> */}
                  <Box className="login__branding-left">
                    <img src={logo} alt="Logo" />
                    <Typography variant="h4" fontWeight={700} color="white">
                      {CONFIG.APP_NAME}
                    </Typography>
                    <Typography variant="subtitle1" color="white">
                      {CONFIG.DESCRIPTIONS.APP_SHORT}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box className="login__image-placeholder">
                  <AuroraSpinner />
                </Box>
              )}
            </Box>
          </Grid>
        )}

        <Grid
          size={{ xs: 12, md: isMobile ? 12 : 7 }}
          className="login__form-container">
          <div className="login__form-wrapper">
            <Box className="login__branding">
              <img src={logo} alt="Logo" className="login__logo" />
              <Typography variant="h4" fontWeight={700}>
                {CONFIG.APP_NAME}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={600} className="login__title">
              {CONFIG.BUTTONS.LOGIN.label}
            </Typography>
            <LoginForm />
            <Typography variant="body2" className="login__copyright">
              &copy; {currentYear} MIS. All rights reserved.
            </Typography>
          </div>
          <Diagonals className="diagonal" />
        </Grid>
      </Grid>
      <Box position={"absolute"} top={28} right={28}>
        {/* <PatchMarker /> */}
      </Box>
    </Box>
  );
};

export default LoginPage;
