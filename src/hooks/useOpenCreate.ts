// File: hooks/useOpenCreate.ts

import { CONFIG } from "../config/config";
import { useRememberQueryParams } from "./useRememberQueryParams";

/**
 * Hook for opening create dialogs via query parameters
 * @returns Functions to open and close create dialogs
 */

//! CHECK USEOPENUPDATE HOOK, SEEMS REDUNDANT

export const affixes = (alias: string, prefix: string = "create") =>
  `${prefix}-${alias.toLowerCase()}`;
export const useOpenCreate = (prefix?: string) => {
  const { currentParams, setQueryParams, removeQueryParams } =
    useRememberQueryParams();

  const isOpen = (alias: string) => {
    return (
      currentParams?.[CONFIG.PREFIX.dialogPrefix] === affixes(alias, prefix)
    );
  };

  const open = (alias: string) => {
    setQueryParams(
      { [CONFIG.PREFIX.dialogPrefix]: affixes(alias, prefix) },
      { retain: true }
    );
  };

  const close = ({
    additionalKeyToClose,
  }: { additionalKeyToClose?: string } = {}) => {
    removeQueryParams([CONFIG.PREFIX.dialogPrefix, additionalKeyToClose ?? ""]);
  };

  return { open, close, isOpen };
};
