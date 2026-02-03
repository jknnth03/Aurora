// src/hooks/useAuth.ts

import { useSnackbar } from "notistack";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { CONFIG } from "../config/config";
import { useLogoutMutation } from "../features/api/aurora/auth/authApi";
import { logoutSuccess } from "../features/slices/auth-slice";
import { clearAllCookiesExcept } from "../utils/cookie";
import { MODULES } from "../config/modules/modules";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [logoutApi] = useLogoutMutation();

  const logout = useCallback(async () => {
    clearAllCookiesExcept([CONFIG.STORAGE.DARK_MODE.LABEL, "SESSION_COOKIE"]);
    dispatch(logoutSuccess());
    navigate(MODULES.LOGIN.PATH);
    try {
      await logoutApi({}).unwrap();
      clearAllCookiesExcept([CONFIG.STORAGE.DARK_MODE.LABEL]);
      enqueueSnackbar("You have been logged out successfully", {
        variant: "success",
      });
    } catch (error) {
      clearAllCookiesExcept([CONFIG.STORAGE.DARK_MODE.LABEL]);
      enqueueSnackbar("Logged out locally", { variant: "info" });
    }
  }, [dispatch, logoutApi, navigate, enqueueSnackbar]);

  return { logout };
};
