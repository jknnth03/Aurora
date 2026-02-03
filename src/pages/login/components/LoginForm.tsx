import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import { Eye, EyeClosed, Lock, User } from "@phosphor-icons/react";
import { useSnackbar } from "notistack";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { z } from "zod";
import AuroraSpinner from "../../../components/ui/aurora-spinner/aurora-spinner";
import CoolTip from "../../../components/ui/cool-tip/cool-tip";
import Input from "../../../components/ui/input/input";
import { CONFIG } from "../../../config/config";
import { useLoginMutation } from "../../../features/api/aurora/auth/authApi";
import { ITokenData } from "../../../features/api/aurora/auth/types";
import { setCredentials } from "../../../features/slices/auth-slice";
import useFieldVisibility from "../../../hooks/useFieldVisibility";
import {
  cookieExists,
  getCookie,
  removeCookie,
  setCookie,
} from "../../../utils/cookie";
import { encrypt } from "../../../utils/crypto";
import { linkify } from "../../../utils/linkify";
import { isApiErrorResponse } from "../../../features/api/aurora/types/types";
import { ApiErrorResponse } from "../../../features/api/aurora/types/types";
// Define the login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

export type TCredentials = z.infer<typeof loginSchema>;
const LoginForm = () => {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { visibility, toggleFieldVisibility } = useFieldVisibility();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<TCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: getCookie("rememberMe") || "",
      password: "",
      rememberMe: cookieExists("rememberMe"),
    },
  });

  const onSubmit: SubmitHandler<TCredentials> = async (data) => {
    try {
      const response = await login({
        username: data.username,
        password: data.password,
      }).unwrap();

      // Handle successful login based on your API response
      if (response && response.token) {
        // Store user data and token in cookie
        const userData: ITokenData = {
          userId: response.data.id,
          username: response.data.username,
          token: response.token,
          role: response.data.role.name,
          permissions: response.data.role.access_permission,
          firstName: response.data.first_name,
          lastName: response.data.last_name,
        };

        // Convert to JSON string before encrypting
        const userDataString = JSON.stringify(userData);

        // Encrypt the user data string before storing in cookie

        const encryptedData = encrypt(userDataString);

        // UCookie.set(CONFIG.COOKIE.SESSION.LABEL, encryptedData, {
        // 	path: "/",
        // 	expires: CONFIG.COOKIE.SESSION.EXPIRATION,
        // 	sameSite: "strict",
        // 	secure: window.location.protocol === "https:",
        // });

        // If rememberMe is checked, save the SESSION

        if (data.rememberMe) {
          setCookie("rememberMe", data.username, {
            path: "/",
            expires: 30, // Store for 30 days
          });
          setCookie(CONFIG.COOKIE.SESSION.LABEL, encryptedData, {
            path: "/",
            expires: CONFIG.COOKIE.SESSION.EXPIRATION,
            sameSite: "strict",
            secure: window.location.protocol === "https:",
          });
        } else {
          // If not checked but the cookie exists, remove it
          if (cookieExists("rememberMe")) {
            removeCookie("rememberMe");
          }
          setCookie(CONFIG.COOKIE.SESSION.LABEL, encryptedData, {
            path: "/",
            expires: 1,
            sameSite: "strict",
            secure: window.location.protocol === "https:",
          });
        }

        // Store user data in Redux state
        dispatch(
          setCredentials({
            tokenData: userData,
            userData: response.data,
          })
        );

        // Show success notification with user's name
        const fullName = `${response.data.first_name} ${response.data.last_name}`;
        enqueueSnackbar(`Welcome back, ${fullName}!`, {
          variant: "success",
        });
        const from = location.state?.from?.pathname
          ? `${location.state?.from?.pathname}${location?.state?.from?.search}`
          : "/";
        navigate(from, { replace: true });
      }
    } catch (error: unknown) {
      if (isApiErrorResponse(error)) {
        error.data.errors.forEach((err) => {
          enqueueSnackbar(err.title || CONFIG.ERRORS.LOGIN_FAILED, {
            variant: "error",
          });

          // Set field errors based on error information
          if (err.title === "Invalid Credentials") {
            setError("username", {
              type: "manual",
              message: "",
            });
            setError("password", {
              type: "manual",
              message: "",
            });
          }
        });
      } else {
        // Fallback for unexpected error formats
        const errorMessage =
          error instanceof Error ? error.message : CONFIG.ERRORS.UNEXPECTED;

        enqueueSnackbar(errorMessage, { variant: "error" });

        // Set generic field errors
        setError("username", {
          type: "manual",
          message: "",
        });
        setError("password", {
          type: "manual",
          message: "",
        });
      }

      //console.error("Login failed", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="login__form">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Controller
            name={"username"}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                tooltip={CONFIG.FIELDS.USERNAME.description}
                label={CONFIG.FIELDS.USERNAME.label}
                startIcon={<User />}
                error={!!errors.username}
                helperText={errors.username?.message}
                fullWidth
                className="login__input"
                required
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type={
                  visibility
                    ? visibility["password"]
                      ? "text"
                      : "password"
                    : "password"
                }
                label="Password"
                required
                startIcon={<Lock />}
                tooltip={linkify(CONFIG.FIELDS.PASSWORD.description)}
                endIcon={
                  <CoolTip title={CONFIG.BUTTONS.SET_VISIBILE.description}>
                    <IconButton
                      size="small"
                      aria-label="toggle password visibility"
                      onClick={() => toggleFieldVisibility("password")}
                      edge="end"
                    >
                      {visibility ? (
                        visibility["password"] ? (
                          <Eye />
                        ) : (
                          <EyeClosed />
                        )
                      ) : (
                        <EyeClosed />
                      )}
                    </IconButton>
                  </CoolTip>
                }
                error={!!errors.password}
                helperText={errors.password?.message}
                fullWidth
                className="login__input"
              />
            )}
          />
        </Box>
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <CoolTip
              title={CONFIG.BUTTONS.REMEMBER.description}
              placement="right"
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value}
                    onChange={field.onChange}
                    color="primary"
                  />
                }
                label={CONFIG.BUTTONS.REMEMBER.label}
                className="login__remember-me"
              />
            </CoolTip>
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isLoading}
          className="login__button"
          title="Login"
          aria-label="Login"
          loading={isLoading}
          loadingIndicator={
            <AuroraSpinner
              size={20}
              primaryColor="InactiveCaptionText"
              secondaryColor="InactiveCaption"
            />
          }
        >
          Login
        </Button>
      </form>
    </>
  );
};

export default LoginForm;
