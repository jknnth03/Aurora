import Box from "@mui/material/Box";
import { ReactNode } from "react";
import Footer from "./footer";
import Header, { HeaderProps } from "./header";
import "./index.scss";
import Grid from "@mui/material/Grid";

const MasterlistLayout = ({
  headerProps,
  children,
  showSearch = true,
}: {
  headerProps?: HeaderProps;
  children: ReactNode;
  showSearch?: boolean;
}) => {
  return (
    <Box className="masterlist-layout">
      <Grid container size={12} spacing={2}>
        <Header {...headerProps} showSearch={showSearch} />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            // bgcolor: "red",
            overflow: "hidden",
          }}
        >
          {children}
        </Box>
        {/* <Footer /> */}
      </Grid>
    </Box>
  );
};

export default MasterlistLayout;
