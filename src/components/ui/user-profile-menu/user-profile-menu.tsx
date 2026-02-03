import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import {
  FinnTheHuman,
  IdentificationCard,
  PersonSimpleRun,
} from "@phosphor-icons/react";
import { useRef } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../../features/slices/auth-slice";
import { useAuth } from "../../../hooks/useAuthenticate";
import { stringAvatar } from "../../../utils/avatar";
import LightDarkModeSwitch from "../light-dark-mode-switch/light-dark-mode-toggle";
import MenuButton from "../sidebar/menu-button";
import ThemePickerButton from "../theme-picker/theme-picker-button";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import { CONFIG } from "../../../config/config";

interface UserProfileMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const UserProfileMenu = ({ anchorEl, open, onClose }: UserProfileMenuProps) => {
  const { logout } = useAuth();
  const modeSwitchRef = useRef<HTMLButtonElement>(null);

  const user = useSelector(selectUser);

  const triggerModeSwitch = () => {
    if (modeSwitchRef.current) {
      modeSwitchRef.current.click();
    }
  };

  const { open: openPalette, isOpen } = useOpenCreate("");

  return (
    <Menu
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "left",
      }}
      elevation={1}
      slotProps={{ paper: { sx: { minWidth: "200px" } } }}
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
    >
      <MenuItem
        disableGutters
        disableRipple
        disableTouchRipple
        sx={{ margin: 0, padding: 0, ":hover": { backgroundColor: "none" } }}
      >
        <MenuButton
          contentSx={{ pr: 4 }}
          onClick={onClose}
          icon={
            <Avatar
              sx={{
                width: 30,
                height: 30,
                ...stringAvatar(`${user?.firstName} ${user?.lastName}`).sx,
              }}
            >
              <FinnTheHuman
                weight="fill"
                size={"14px"}
                color={
                  stringAvatar(`${user?.firstName} ${user?.lastName}`).sx.color
                }
              />
            </Avatar>
          }
          content={
            <Box display={"flex"}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                <Typography variant="button">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" lineHeight={1}>
                  {user?.role}
                </Typography>
              </Box>
            </Box>
          }
          sx={{
            width: "100%",
            ":hover:not(&--active)::before": {
              backgroundColor: "transparent",
            },
          }}
        />
      </MenuItem>
      <Divider />
      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <IdentificationCard />
        </ListItemIcon>
        <ListItemText>Account</ListItemText>
      </MenuItem>
      <MenuItem onClick={triggerModeSwitch}>
        <ListItemIcon>
          <LightDarkModeSwitch ref={modeSwitchRef} size="xxxs" />
        </ListItemIcon>
        <ListItemText>Dark Mode</ListItemText>
      </MenuItem>
      <MenuItem
        onClick={() => {
          openPalette(CONFIG.SUFFIX.theme_picker);
        }}
      >
        <ListItemIcon>
          <ThemePickerButton />
        </ListItemIcon>
        <ListItemText>Palette Picker</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={logout}>
        <ListItemIcon>
          <PersonSimpleRun />
        </ListItemIcon>
        <ListItemText>Logout</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default UserProfileMenu;
