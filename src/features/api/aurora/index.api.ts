import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CONFIG } from "../../../config/config";
import { getCookie } from "../../../utils/cookie";
import { decrypt } from "../../../utils/crypto";
import { ITokenData } from "./auth/types";

export const api = createApi({
  reducerPath: "auroraApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CONFIG.BASE_URL,

    prepareHeaders: (headers) => {
      // Step 1: Get the cookie value
      const cookieValue = getCookie(CONFIG.COOKIE.SESSION.LABEL);

      if (cookieValue) {
        try {
          // Step 2: Decrypt the cookie value to get the JSON string
          const decryptedStr = decrypt(cookieValue);

          try {
            // Step 3: Parse the JSON string to get the token data object
            const decrypted = JSON.parse(decryptedStr) as ITokenData;

            if (decrypted && decrypted.token) {
              // Step 4: Set the Authorization header with the decrypted token
              headers.set("Authorization", `Bearer ${decrypted.token}`);
            }
          } catch (parseError) {}
        } catch (error) {}
      }

      // Set the Accept header for all requests
      headers.set("Accept", "application/json");

      return headers;
    },
  }),
  tagTypes: ["Aurora"],
  endpoints: () => ({}),
});
