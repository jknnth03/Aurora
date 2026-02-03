// src/components/ui/sidebar/useSidebarContextMenu.tsx

import {
  ArrowSquareIn,
  DownloadSimple,
  FileMd,
  Gear,
  Heart,
  RocketLaunch,
  UploadSimple,
  UserPlus,
} from "@phosphor-icons/react";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { MODULES, TModule } from "../../../config/modules/modules";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import { usePageParams } from "../../../hooks/usePageParams";
import { useBookmark } from "../bookmarks/useBookmark";
import { ContextMenuItem } from "../context-menu/context-menu";

// Constants
const ICON_SIZE = 18;
const ICON_WEIGHT = "bold" as const;
const CHILD_PADDING_LEFT = 4;

/**
 * Hook to provide context menu items for sidebar menu items
 */
export const useSidebarContextMenu = () => {
  const navigate = useNavigate();
  const { getQueryStringForPath } = usePageParams();
  const { open } = useOpenCreate();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmark();

  // Helper function to create bookmark icon
  const createBookmarkIcon = useCallback((isBookmarked: boolean) => {
    return isBookmarked ? (
      <Heart size={ICON_SIZE} weight="fill" color="var(--error-light)" />
    ) : (
      <Heart size={ICON_SIZE} weight={ICON_WEIGHT} />
    );
  }, []);

  // Helper function to handle bookmark toggle
  const handleBookmarkToggle = useCallback(
    (module: TModule) => {
      const queryString = getQueryStringForPath(module.PATH);
      const bookmarked = isBookmarked(module.ALIAS);

      if (bookmarked) {
        removeBookmark(module.ALIAS);
      } else {
        addBookmark(module.ALIAS, module.PATH + queryString);
      }
    },
    [getQueryStringForPath, isBookmarked, addBookmark, removeBookmark],
  );

  // Helper function to create base menu items
  const createBaseItems = useCallback(
    (module: TModule): Array<ContextMenuItem<TModule>> => {
      const bookmarked = isBookmarked(module.ALIAS);

      return [
        {
          id: "navigate",
          label: () => `See ${module.ALIAS}`,
          icon: <ArrowSquareIn size={ICON_SIZE} weight={ICON_WEIGHT} />,
          onClick: () => {
            const queryString = getQueryStringForPath(module.PATH);
            navigate(module.PATH + queryString);
          },
        },
        {
          id: "bookmark",
          label: () => (bookmarked ? "Unbookmark" : "Bookmark"),
          icon: () => createBookmarkIcon(bookmarked),
          onClick: () => handleBookmarkToggle(module),
        },
      ];
    },
    [
      navigate,
      getQueryStringForPath,
      isBookmarked,
      createBookmarkIcon,
      handleBookmarkToggle,
    ],
  );

  // Module-specific menu configurations
  const moduleSpecificItems = useMemo<
    Record<string, Array<Omit<ContextMenuItem<TModule>, "id">>>
  >(
    () => ({
      [MODULES.MASTERLIST.CHILDREN?.USERS.PATH || ""]: [
        {
          label: () => "New User",
          icon: <UserPlus size={ICON_SIZE} weight={ICON_WEIGHT} />,
          onClick: () => open(MODULES.MASTERLIST.CHILDREN!.USERS.ALIAS),
        },
        {
          label: () => "Export users list",
          icon: <DownloadSimple size={ICON_SIZE} weight={ICON_WEIGHT} />,
          onClick: () => {
            /* Export users functionality */
          },
        },
        {
          label: () => "Import users",
          icon: <UploadSimple size={ICON_SIZE} weight={ICON_WEIGHT} />,
          onClick: () => {
            /* Import users functionality */
          },
        },
      ],
      [MODULES.MASTERLIST.CHILDREN?.ROLES.PATH || ""]: [
        {
          label: () => "Create new role",
          icon: <UserPlus size={ICON_SIZE} weight={ICON_WEIGHT} />,
          onClick: () => open(MODULES.MASTERLIST.CHILDREN!.ROLES.ALIAS),
        },
      ],
      // [MODULES.MASTERLIST.CHILDREN?.PATCH_NOTES.PATH || ""]: [
      // 	{
      // 		label: () => "Create new Patch Note",
      // 		icon: <RocketLaunch size={ICON_SIZE} weight={ICON_WEIGHT} />,
      // 		onClick: () => open(MODULES.MASTERLIST.CHILDREN!.PATCH_NOTES.ALIAS),
      // 	},
      // 	{
      // 		label: () => "Write a Markdown",
      // 		icon: <FileMd size={ICON_SIZE} weight={ICON_WEIGHT} />,
      // 		onClick: () => open("mdown"),
      // 	},
      // ],
      // [MODULES.MASTERLIST.CHILDREN?.COMPANIES.PATH || ""]: [
      // 	{
      // 		label: () => "Create new company",
      // 		icon: <Buildings size={ICON_SIZE} weight={ICON_WEIGHT} />,
      // 		onClick: () => {
      // 			/* Create company functionality */
      // 		},
      // 	},
      // 	{
      // 		label: () => "Export companies",
      // 		icon: <DownloadSimple size={ICON_SIZE} weight={ICON_WEIGHT} />,
      // 		onClick: () => {
      // 			/* Export companies functionality */
      // 		},
      // 	},
      // ],
      // [MODULES.MASTERLIST.CHILDREN?.BUSINESS_UNITS.PATH || ""]: [
      // 	{
      // 		label: () => "Create business unit",
      // 		icon: <Buildings size={ICON_SIZE} weight={ICON_WEIGHT} />,
      // 		onClick: () => {
      // 			/* Create business unit functionality */
      // 		},
      // 	},
      // ],
      // [MODULES.MASTERLIST.CHILDREN?.DEPARTMENTS.PATH || ""]: [
      // 	{
      // 		label: () => "Create department",
      // 		icon: <Buildings size={ICON_SIZE} weight={ICON_WEIGHT} />,
      // 		onClick: () => {
      // 			/* Create department functionality */
      // 		},
      // 	},
      // ],
      // [MODULES.MASTERLIST.CHILDREN?.WAREHOUSES.PATH || ""]: [
      // 	{
      // 		label: () => "Create warehouse",
      // 		icon: <Warehouse size={ICON_SIZE} weight={ICON_WEIGHT} />,
      // 		onClick: () => {
      // 			/* Create warehouse functionality */
      // 		},
      // 	},
      // ],
      [MODULES.SETTINGS.PATH]: [
        {
          label: () => "Reset to defaults",
          icon: <Gear size={ICON_SIZE} weight={ICON_WEIGHT} />,
          onClick: () => {
            /* Reset settings functionality */
          },
        },
      ],
    }),
    [open],
  );

  const getMenuItems = useCallback(
    (module: TModule): Array<ContextMenuItem<TModule>> => {
      const baseItems = createBaseItems(module);
      const specificItems = moduleSpecificItems[module.PATH] || [];

      // Add unique IDs to specific items
      const specificItemsWithIds = specificItems.map((item, index) => ({
        ...item,
        id: `${module.PATH}-item-${index}`,
      }));

      return [...baseItems, ...specificItemsWithIds];
    },
    [createBaseItems, moduleSpecificItems],
  );

  // Helper function to create divider
  const createDivider = useCallback(
    (childModule: TModule): ContextMenuItem<TModule> => ({
      id: `divider-${childModule.PATH}`,
      label: () => "",
      icon: null,
      onClick: () => {},
      menuItemProps: {
        divider: true,
        sx: {
          backgroundColor: "transparent",
          margin: "3px 0",
          cursor: "default",
          "&.MuiMenuItem-root": {
            backgroundColor: "transparent",
          },
        },
      },
    }),
    [],
  );

  // Helper function to create header
  const createHeader = useCallback(
    (childModule: TModule): ContextMenuItem<TModule> => ({
      id: `header-${childModule.PATH}`,
      label: () => childModule.ALIAS,
      icon: childModule.ICON_ON,
      onClick: () => {},
      menuItemProps: {
        sx: {
          pointerEvents: "none",
          color: "primary.main",
          "& .MuiListItemIcon-root": {
            svg: {
              fill: "var(--primary-main)",
            },
          },
        },
      },
    }),
    [],
  );

  // Helper function to add padding to child items
  const addPaddingToItems = useCallback(
    (
      items: Array<ContextMenuItem<TModule>>,
    ): Array<ContextMenuItem<TModule>> => {
      return items.map((item) => ({
        ...item,
        menuItemProps: {
          ...item.menuItemProps,
          sx: {
            ...(item.menuItemProps?.sx || {}),
            paddingLeft: CHILD_PADDING_LEFT,
          },
        },
      }));
    },
    [],
  );

  /**
   * Get menu items for a module, handling parent items with children
   */
  const getMenuItemsForModule = useCallback(
    (item: TModule): Array<ContextMenuItem<TModule>> => {
      if (!item.CHILDREN || Object.keys(item.CHILDREN).length === 0) {
        return getMenuItems(item);
      }

      const combinedMenuItems: Array<ContextMenuItem<TModule>> = [];
      const childEntries = Object.entries(item.CHILDREN);

      childEntries.forEach(([key, childModule], index) => {
        // Add divider before each child (except first)
        if (index > 0) {
          combinedMenuItems.push(createDivider(childModule));
        }

        // Add header for child module
        combinedMenuItems.push(createHeader(childModule));

        // Get child menu items and add padding
        const childMenuItems = getMenuItems(childModule);

        const paddedChildItems = addPaddingToItems(childMenuItems);

        const proppedItems = paddedChildItems.map((item) => {
          return {
            ...item,
            menuItemProps: {
              sx: { ...(item.menuItemProps?.sx || {}), borderRadius: 1 },
            },
          };
        });

        combinedMenuItems.push(...proppedItems);
      });

      return combinedMenuItems;
    },
    [getMenuItems, createDivider, createHeader, addPaddingToItems],
  );

  return { getMenuItems, getMenuItemsForModule };
};

export default useSidebarContextMenu;
