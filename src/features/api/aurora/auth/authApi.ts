import { CONFIG } from "../../../../config/config";
import { getCookie } from "../../../../utils/cookie";
import { decrypt } from "../../../../utils/crypto";
import { api } from "../index.api";
import { ApiResponse } from "../types";
import { ICredentials, ILoginResponse, ITokenData } from "./types";

const authApi = api
  .enhanceEndpoints({ addTagTypes: ["User"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      login: builder.mutation<ILoginResponse, ICredentials>({
        query: (credentials) => {
          // Use development credentials if in development mode
          const env = import.meta.env.VITE_ENV || "local";
          if (env === "local" || env === "dev") {
            return {
              url: "/login",
              method: "POST",
              body: {
                username: credentials.username,
                password:
                  credentials.password ??
                  import.meta.env.VITE_AURORA_MASTER_KEY,
              },
            };
          } else {
            return {
              url: "/login",
              method: "POST",
              body: credentials,
            };
          }
        },
      }),

      logout: builder.mutation({
        query: () => {
          const cookieValue = getCookie(CONFIG.COOKIE.SESSION.LABEL);
          const decryptedToken = () => {
            if (cookieValue) {
              try {
                // First decrypt to string
                const decryptedStr = decrypt(cookieValue);
                try {
                  // Then parse the JSON string
                  const decrypted = JSON.parse(decryptedStr) as ITokenData;

                  if (decrypted && decrypted.token) {
                    return decrypted.token;
                  } else {
                    console.error("Token not found in decrypted data");
                  }
                } catch (parseError) {
                  console.error(
                    "Failed to parse JSON from decrypted cookie:",
                    parseError
                  );
                }
              } catch (error) {
                console.error("Error decrypting token:", error);
              }
            }
            return null;
          };

          return {
            url: "/logout",
            method: "POST",
            headers: { Authorization: `Bearer ${decryptedToken()}` },
          };
        },
      }),
      // PATCH - Change user password
      changePassword: builder.mutation<
        ApiResponse<null>,
        { id: string; oldPassword: string; newPassword: string }
      >({
        query: ({ id, ...passwords }) => ({
          url: `${CONFIG.ENDPOINTS.USERS}/${id}/change-password`,
          method: "PATCH",
          body: passwords,
        }),
      }),

      // PATCH - Reset user password
      resetPassword: builder.mutation<ApiResponse<null>, string | number>({
        query: (id) => ({
          url: `${CONFIG.ENDPOINTS.USERS}/${id}/reset_password`,
          method: "PATCH",
        }),
      }),
    }),
  });

export const { useLoginMutation, useLogoutMutation, useResetPasswordMutation } =
  authApi;
