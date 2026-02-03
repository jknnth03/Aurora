// File: hooks/useOpenUpdate.ts

import { CONFIG } from "../config/config";
import { useRememberQueryParams } from "./useRememberQueryParams";

/**
 * Hook for opening update dialogs via query parameters
 * @returns Functions to open and close update dialogs
 */

const suffix = (alias: string) => `update-${alias.toLowerCase()}`;
export const useOpenUpdate = () => {
  const { currentParams, setQueryParams, removeQueryParams } =
    useRememberQueryParams();

  const isOpen = (alias: string) => {
    return currentParams?.[CONFIG.PREFIX.dialogPrefix] === suffix(alias);
  };

  const open = <TId extends string | number>(alias: string, id?: TId) => {
    if (id !== undefined) {
      setQueryParams({
        [CONFIG.PREFIX.dialogPrefix]: suffix(alias),
        id: String(id),
      });
    } else {
      setQueryParams({ [CONFIG.PREFIX.dialogPrefix]: suffix(alias) });
    }
  };

  const close = ({
    additionalKeyToClose,
  }: { additionalKeyToClose?: string } = {}) => {
    removeQueryParams([
      CONFIG.PREFIX.dialogPrefix,
      "id",
      additionalKeyToClose ?? "",
    ]);
  };

  return { open, close, isOpen };
};
