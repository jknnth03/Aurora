import Box, { BoxProps } from "@mui/material/Box";
import Typography, { TypographyProps } from "@mui/material/Typography";
import SearchComponent, {
  SearchFieldProps,
} from "../../ui/search-field/search-field";
import { ReactNode } from "react";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

export interface HeaderProps {
  // Title content - can be string or ReactNode for complex titles
  title?: ReactNode;

  // Default title to use if no title is provided
  defaultTitle?: string;

  // Optional search component visibility
  showSearch?: boolean;

  // Content areas for custom elements
  leftContent?: ReactNode;
  centerContent?: ReactNode;
  rightContent?: ReactNode;

  // Additional elements to appear below the main header row
  bottomContent?: ReactNode;

  // Custom styling
  sx?: BoxProps["sx"];
  titleSx?: TypographyProps["sx"];
  searchFieldProps?: SearchFieldProps;
  icon?: ReactNode;
}

const Header = ({
  title,
  defaultTitle = "", // Default title if none provided
  showSearch = true,
  leftContent,
  centerContent,
  rightContent,
  icon,
  bottomContent,
  sx = {},
  titleSx = {},
  searchFieldProps = {},
}: HeaderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Box
      sx={{
        width: "100%",
        ...sx,
      }}
    >
      {/* Main header row */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: bottomContent ? 2 : 0 }}
      >
        {/* Left section */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ display: "flex", gap: 1 }}>
            {icon ? (
              <Box
                sx={{
                  width: "fit-content",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  justifySelf: "flex-end",
                }}
              >
                {icon}
              </Box>
            ) : (
              <></>
            )}
            {!isMobile ? (
              <Typography variant="h4" fontWeight="500" sx={{ ...titleSx }}>
                {title || defaultTitle}
              </Typography>
            ) : (
              <></>
            )}
          </Box>
          {leftContent}
        </Stack>

        {/* Center section */}
        {centerContent && (
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            {centerContent}
          </Box>
        )}

        {/* Right section */}
        <Stack
          direction="row"
          alignItems="end"
          sx={{ verticalAlign: "middle", textAlign: "right" }}
        >
          {rightContent}
          {showSearch && <SearchComponent {...searchFieldProps} />}
        </Stack>
      </Stack>

      {/* Bottom section for additional content */}
      {bottomContent && <Box sx={{ mt: 2 }}>{bottomContent}</Box>}
    </Box>
  );
};

export default Header;
