// src/hooks/usePermission.ts
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { IPermission, IPermissions } from "../features/api/aurora/auth/types";
import { useMemo } from "react";
import { MODULES, TModule } from "../config/modules/modules";

/**
 * Custom hook to check user permissions
 */
const flattenModules = (modules: TModule[]): TModule[] => {
  const flattened: TModule[] = [];

  const flatten = (module: TModule) => {
    // Add the current module (without children in the flattened version)

    flattened.push(module);

    // Recursively flatten children
    if (module.CHILDREN) {
      Object.values(module.CHILDREN).forEach((child) => flatten(child));
    }
  };

  modules.forEach((module) => flatten(module));
  return flattened;
};

const filterModuleWithChildren = (
  module: TModule,
  userPermissions: string[]
): TModule | null => {
  // First, filter children recursively
  const hasCreateUser = userPermissions.some(
    (permission) => permission === "Create User"
  );
  let filteredChildren: { [key: string]: TModule } | undefined;

  if (module.CHILDREN) {
    const childEntries = Object.entries(module.CHILDREN)
      .map(([key, child]) => {
        const filteredChild = filterModuleWithChildren(child, userPermissions);
        return filteredChild ? [key, filteredChild] : null;
      })
      .filter(Boolean) as [string, TModule][];

    if (childEntries.length > 0) {
      filteredChildren = Object.fromEntries(childEntries);
    }
  }

  // Include module if it has permission OR if it Îhas permitted children
  const hasDirectPermission = userPermissions.includes(module.KEY);
  const hasPermittedChildren =
    filteredChildren && Object.keys(filteredChildren).length > 0;

  if (hasDirectPermission || hasPermittedChildren || hasCreateUser) {
    return {
      ...module,
      ...(filteredChildren && { CHILDREN: filteredChildren }),
    };
  }

  return null;
};

const usePermission = () => {
  // Call useSelector once at the top level of the hook

  /**
   * Get all user permissions
   */
  const menuItems = useMemo(() => Object.values(MODULES) || [], []);

  const userPermissions = useSelector(
    (state: RootState) => state?.auth?.user?.permissions
  );
  const flatModules = flattenModules(menuItems);

  const modulePermissions = useMemo(() => {
    return flatModules.filter(
      (module: TModule) => !module.DISINCLUDE && !module.CHILDREN
    );
  }, [flatModules]);

  /**
   * Filter modules recursively based on permissions
   * @param module The module to filter
   * @param userPermissions User's permissions array
   */
  const filteredModules = useMemo(() => {
    return menuItems.filter((module: TModule) => !module.DISINCLUDE);
  }, [menuItems]);

  /**
   * Get permitted modules with nested structure preserved
   */
  const permittedModules = useMemo(() => {
    if (userPermissions?.length === 0 || !userPermissions) return [];
    return filteredModules
      .map((module) => filterModuleWithChildren(module, userPermissions))
      .filter(Boolean) as TModule[];
  }, [menuItems, userPermissions]);

  /**
   * Flatten modules recursively to get all permitted modules in a flat array
   * @param modules Array of modules to flatten
   */

  /**
   * Get permitted modules as a flat array
   */
  const permittedModulesFlat = useMemo(() => {
    return flattenModules(permittedModules);
  }, [permittedModules]);

  /**
   * Check if user has a specific permission
   * @param permission Permission to check
   */
  const hasPermission = (permission: IPermission): boolean => {
    return userPermissions?.includes(permission) || false;
  };

  /**
   * Check if a module or any of its children has permission
   * @param module The module to check
   * @param userPermissions User's permissions array
   */
  const hasModulePermission = (
    module: TModule,
    userPermissions: string[]
  ): boolean => {
    // Check if the module itself has permission
    if (userPermissions.includes(module.KEY)) {
      return true;
    }

    // Check children recursively
    if (module.CHILDREN) {
      return Object.values(module.CHILDREN).some((child: TModule) =>
        hasModulePermission(child, userPermissions)
      );
    }

    return false;
  };

  const hasPathPermission = (path: TModule["PATH"]): boolean => {
    return permittedModulesFlat?.some((module) => module.PATH === path);
  };

  /**
   * Check if user has any of the specified permissions
   * @param permissionsToCheck Array of permissions to check
   */
  const hasAnyPermission = (permissionsToCheck: IPermissions): boolean => {
    return permissionsToCheck.some((permission) =>
      userPermissions?.includes(permission)
    );
  };

  /**
   * Check if user has all of the specified permissions
   * @param permissionsToCheck Array of permissions to check
   */
  const hasAllPermissions = (permissionsToCheck: IPermissions): boolean => {
    return permissionsToCheck.every((permission) =>
      userPermissions?.includes(permission)
    );
  };

  return {
    hasPermission,
    hasAnyPermission,
    flatModules,
    hasAllPermissions,
    userPermissions,
    // NEW: Permitted modules with nested structure preserved
    permittedModules,
    // NEW: Permitted modules as a flat array
    permittedModulesFlat,
    // Helper functions
    modulePermissions,
    hasPathPermission,
    hasModulePermission: (module: TModule) =>
      hasModulePermission(module, userPermissions || []),
  };
};

export default usePermission;
