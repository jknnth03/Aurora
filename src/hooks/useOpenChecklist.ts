// File: hooks/useOpenUpdate.ts

import { CONFIG } from "../config/config";
import { useRememberQueryParams } from "./useRememberQueryParams";

/**
 * Hook for opening checklist view dialog via query parameters
 * @returns Functions to open and close view checklist dialog
 */

const suffix = (alias: string) => `view-${alias.toLowerCase()}`;
export const useOpenChecklist = () => {
  const { currentParams, setQueryParams, removeQueryParams } =
    useRememberQueryParams();
  const isOpen = (alias: string) => {
    const convertedAlias = alias.replace(" ", "-");
    return (
      currentParams?.[CONFIG.PREFIX.dialogPrefix] === suffix(convertedAlias)
    );
  };
  const open = <TId extends string | number>(alias: string, id?: TId) => {
    const convertedAlias = alias.replace(" ", "-");
    if (id !== undefined) {
      setQueryParams(
        {
          [CONFIG.PREFIX.dialogPrefix]: suffix(convertedAlias),
          id: String(id),
        },
        { retain: true }
      );
    } else {
      setQueryParams(
        { [CONFIG.PREFIX.dialogPrefix]: suffix(alias) },
        { retain: true }
      );
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
