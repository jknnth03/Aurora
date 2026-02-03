// SidebarFooter.tsx
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FinnTheHuman, Orange } from "@phosphor-icons/react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../../features/slices/auth-slice";
import { stringAvatar } from "../../../utils/avatar";
import MenuButton from "./menu-button";
import UserProfileMenu from "../user-profile-menu/user-profile-menu";

const SidebarFooter = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const user = useSelector(selectUser);

  return (
    <>
      <MenuButton
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
        onContextMenu={handleClick}
        content={
          <Box display={"flex"} flex={1} justifyContent={"flex-start"}>
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
        rightIcon={<Orange />}
        onClick={handleClick}
        sx={{
          width: "100%",
        }}
      />

      <UserProfileMenu anchorEl={anchorEl} open={open} onClose={handleClose} />
    </>
  );
};

export default SidebarFooter;
