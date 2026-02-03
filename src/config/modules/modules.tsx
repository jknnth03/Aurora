import Icon from "@mui/material/Icon";
import {
  AddressBookTabs,
  Bell,
  BellRinging,
  Buildings,
  City,
  ClipboardText,
  ClockCounterClockwise,
  Code,
  Download,
  Envelope,
  FinnTheHuman,
  Gear,
  GearSix,
  Globe,
  Info,
  Layout,
  ListChecks,
  LockKey,
  Password,
  PottedPlant,
  RocketLaunch,
  ShieldCheck,
  ShieldStar,
  SignIn,
  Star,
  Storefront,
  Translate,
  Trash,
  User,
  UserCircle,
  Wrench,
} from "@phosphor-icons/react";
import { ReactNode } from "react";
import OneChargingFilled from "../../assets/Auroraone_charging_filled.svg?react";
import OneCharging from "../../assets/Auroraone_rdf_icon.svg?react";
import Box from "@mui/material/Box";

export type TModule = {
  ALIAS: string;
  PATH: string;
  ICON?: ReactNode;
  KEY: string;
  ICON_ON?: ReactNode;
  DESCRIPTION?: string;
  DISINCLUDE?: boolean;
  CHILDREN?: Record<string, TModule>;
};

export type ModuleKey =
  | "LOGIN"
  | "SIGNUP"
  | "DASHBOARD"
  | "MASTERLIST"
  | "SETTINGS"
  | "PATCH"
  | "QA"
  | "REGION_HEAD"
  | "AREA_HEAD"
  | "SURVEY_APPROVER";

export type MasterlistChildKey =
  | "ONE_CHARGING"
  | "USERS"
  | "ROLES"
  | "REGION"
  | "AREA"
  | "STORE"
  | "STORE_CHECKLIST"
  | "SCORE_RATING"
  | "CHECKLIST"
  | "PATCH_NOTES";

export type AccountTitleChildKey =
  | "FINANCIAL_STATEMENTS"
  | "ACCOUNT_SUBGROUPS"
  | "ACCOUNT_GROUPS"
  | "ACCOUNT_TYPES"
  | "NORMAL_BALANCES"
  | "ACCOUNT_UNITS"
  | "CREDITS";

export type SettingsChildKey =
  | "GENERAL"
  | "PROFILE"
  | "NOTIFICATIONS"
  | "SECURITY"
  | "ADVANCED"
  | "INFO";

export type GeneralChildKey = "THEME" | "LANGUAGE" | "DEFAULT_DASHBOARD";

export type ProfileChildKey = "PERSONAL_INFO" | "PROFILE_PICTURE";

export type NotificationsChildKey =
  | "EMAIL_NOTIFICATIONS"
  | "SYSTEM_NOTIFICATIONS";

export type SecurityChildKey = "PASSWORD" | "TWO_FACTOR" | "LOGIN_HISTORY";

export type AdvancedChildKey = "DATA_EXPORT" | "API_ACCESS" | "DELETE_ACCOUNT";

export type TModuleMap = {
  [key in ModuleKey]: TModule;
};

export type TFullModules = {
  LOGIN: TModule;
  SIGNUP: TModule;
  DASHBOARD: TModule;
  MASTERLIST: TModule & {
    CHILDREN: {
      [key in MasterlistChildKey]: TModule;
    };
  };
  QA: TModule;
  SURVEY_APPROVER: TModule;
  REGION_HEAD: TModule;
  AREA_HEAD: TModule;
  SETTINGS: TModule & {
    CHILDREN: {
      GENERAL: TModule & {
        CHILDREN: {
          [key in GeneralChildKey]: TModule;
        };
      };
      PROFILE: TModule & {
        CHILDREN: {
          [key in ProfileChildKey]: TModule;
        };
      };
      NOTIFICATIONS: TModule & {
        CHILDREN: {
          [key in NotificationsChildKey]: TModule;
        };
      };
      SECURITY: TModule & {
        CHILDREN: {
          [key in SecurityChildKey]: TModule;
        };
      };
      ADVANCED: TModule & {
        CHILDREN: {
          [key in AdvancedChildKey]: TModule;
        };
      };
      INFO: TModule;
    };
  };
  PATCH: TModule;
};

export const MODULES: TFullModules = {
  LOGIN: {
    ALIAS: "Login",
    PATH: "/login",
    KEY: "login",
    ICON: <SignIn />,
    DISINCLUDE: true,
    ICON_ON: <SignIn weight="fill" />,
    DESCRIPTION: "Authentication portal for users to access the system.",
  },
  SIGNUP: {
    ALIAS: "Sign Up",
    PATH: "/signup",
    KEY: "signup",
    DISINCLUDE: true,
    ICON: <ClipboardText />,
    ICON_ON: <ClipboardText weight="fill" />,
    DESCRIPTION: "New user registration interface for account creation.",
  },

  DASHBOARD: {
    ALIAS: "Dashboard",
    PATH: "/dashboard",
    KEY: "dashboard",
    ICON: <PottedPlant />,
    ICON_ON: <PottedPlant weight="fill" />,
    DESCRIPTION: "Primary overview displaying key metrics and system status.",
  },

  MASTERLIST: {
    ALIAS: "Masterlist",
    PATH: "/masterlist",
    KEY: "masterlist",
    ICON: <AddressBookTabs />,
    ICON_ON: <AddressBookTabs weight="fill" />,
    DESCRIPTION:
      "Central repository for managing all system entities and resources.",
    CHILDREN: {
      ONE_CHARGING: {
        ALIAS: "One Charging",
        KEY: "one_charging",
        PATH: "/one_charging",
        ICON: (
          <Icon
            fontSize="inherit"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <OneCharging fontSize={"inherit"} height={"24px"} width={"100%"} />
          </Icon>
        ),
        ICON_ON: (
          <Icon
            fontSize="inherit"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            color="warning">
            <OneChargingFilled
              fontSize={"inherit"}
              height={"24px"}
              width={"100%"}
            />
          </Icon>
        ),
        DESCRIPTION: "Manage system users, permissions and account details.",
      },
      USERS: {
        ALIAS: "Users",
        KEY: "users",
        PATH: "/users",
        ICON: <FinnTheHuman />,
        ICON_ON: <FinnTheHuman weight="fill" />,
        DESCRIPTION: "Manage system users, permissions and account details.",
      },
      ROLES: {
        ALIAS: "Roles",
        KEY: "roles",
        PATH: "/roles",
        ICON: <ShieldStar />,
        ICON_ON: <ShieldStar weight="fill" />,
        DESCRIPTION: "Configure user roles and their associated permissions.",
      },
      REGION: {
        ALIAS: "Region",
        KEY: "region",
        PATH: "/region",
        ICON: <City />,
        ICON_ON: <City weight="fill" />,
        DESCRIPTION: "Configure regions and their associated region details",
      },
      AREA: {
        ALIAS: "Area",
        KEY: "area",
        PATH: "/area",
        ICON: <Buildings />,
        ICON_ON: <Buildings weight="fill" />,
        DESCRIPTION: "Configure areas and their associated area details.",
      },
      CHECKLIST: {
        ALIAS: "Checklist",
        KEY: "checklist",
        PATH: "/checklist",
        ICON: <ListChecks />,
        ICON_ON: <ListChecks weight="fill" />,
        DESCRIPTION:
          "Configure checklists, their checklist structure, and their associated checklist details.",
      },
      STORE: {
        ALIAS: "Store",
        KEY: "store",
        PATH: "/store",
        ICON: <Storefront />,
        ICON_ON: <Storefront weight="fill" />,
        DESCRIPTION: "Configure stores and their associated store details.",
      },
      STORE_CHECKLIST: {
        ALIAS: "Store Checklist",
        KEY: "store_checklist",
        PATH: "/store_checklist",
        ICON: (
          <Box>
            <Storefront />
            <ListChecks />
          </Box>
        ),
        ICON_ON: (
          <Box>
            <Storefront weight="fill" />
            <ListChecks weight="fill" />
          </Box>
        ),
        DESCRIPTION: "Configure store and checklist taggings.",
      },
      SCORE_RATING: {
        ALIAS: "Score Rating",
        KEY: "score_rating",
        PATH: "/score_rating",
        ICON: <Star />,
        ICON_ON: <Star weight="fill" />,
        DESCRIPTION: "Configure score ratings.",
      },
      // PATCH_NOTES: {
      //   ALIAS: "Patch Notes",
      //   KEY: "patch_notes",
      //   PATH: "/patch_notes",
      //   ICON: <RocketLaunch />,
      //   ICON_ON: <RocketLaunch weight="fill" />,
      //   DESCRIPTION: "Configure user roles and their associated permissions.",
      // },
    },
  },

  QA: {
    ALIAS: "Quality Assurance",
    PATH: "/quality_assurance",
    KEY: "qualityAssurance",
    ICON: <ListChecks weight="regular" />,
    ICON_ON: <ListChecks weight="fill" />,
    DESCRIPTION:
      "Central repository for managing all system entities and resources.",
  },
  SURVEY_APPROVER: {
    ALIAS: "Survey Approver",
    PATH: "/approver_dashboard",
    KEY: "surveyApprover",
    ICON: <User weight="regular" />,
    ICON_ON: <User weight="fill" />,
    DESCRIPTION: "Central repository for managing all survey approvers",
  },
  AREA_HEAD: {
    ALIAS: "Area Head",
    PATH: "/area_head",
    KEY: "areaHead",
    ICON: (
      <Box>
        <Buildings />
        <UserCircle />
      </Box>
    ),
    ICON_ON: (
      <Box>
        <Buildings weight="fill" />
        <UserCircle weight="fill" />
      </Box>
    ),
    DESCRIPTION: "Central repository for viewing all area heads.",
  },
  REGION_HEAD: {
    ALIAS: "Region Head",
    PATH: "/region_head",
    KEY: "regionHead",
    ICON: (
      <Box>
        <City />
        <UserCircle />
      </Box>
    ),
    ICON_ON: (
      <Box>
        <City weight="fill" />
        <UserCircle weight="fill" />
      </Box>
    ),
    DESCRIPTION: "Central repository for viewing all region heads.",
  },
  SETTINGS: {
    ALIAS: "Settings",
    PATH: "/settings",
    KEY: "settings",
    ICON: <Gear />,
    ICON_ON: <Gear weight="fill" />,
    DESCRIPTION: "Configure system preferences and application settings.",
    CHILDREN: {
      GENERAL: {
        ALIAS: "General",
        KEY: "general",
        PATH: "/general",
        ICON: <GearSix />,
        ICON_ON: <GearSix weight="fill" />,
        DESCRIPTION: "Configure general application settings and preferences.",
        CHILDREN: {
          THEME: {
            ALIAS: "Theme Settings",
            KEY: "theme_settings",
            PATH: "/theme",
            ICON: <Globe />,
            ICON_ON: <Globe weight="fill" />,
            DESCRIPTION: "Configure application appearance and layout options.",
          },
          LANGUAGE: {
            ALIAS: "Language Settings",
            KEY: "language_settings",
            PATH: "/language",
            ICON: <Translate />,
            ICON_ON: <Translate weight="fill" />,
            DESCRIPTION: "Set your preferred language and region settings.",
          },
          DEFAULT_DASHBOARD: {
            ALIAS: "Default Dashboard",
            KEY: "default_dashboard",
            PATH: "/dashboard",
            ICON: <Layout />,
            ICON_ON: <Layout weight="fill" />,
            DESCRIPTION:
              "Configure which dashboard you see when you first log in.",
          },
        },
      },
      PROFILE: {
        ALIAS: "Profile",
        KEY: "profile",
        PATH: "/profile",
        ICON: <UserCircle />,
        ICON_ON: <UserCircle weight="fill" />,
        DESCRIPTION: "Update your profile information and preferences.",
        CHILDREN: {
          PERSONAL_INFO: {
            ALIAS: "Personal Information",
            KEY: "personal_info",
            PATH: "/personal",
            ICON: <User />,
            ICON_ON: <User weight="fill" />,
            DESCRIPTION: "Update your name, email, and contact details.",
          },
          PROFILE_PICTURE: {
            ALIAS: "Profile Picture",
            KEY: "profile_picture",
            PATH: "/picture",
            ICON: <User />,
            ICON_ON: <User weight="fill" />,
            DESCRIPTION: "Change your profile photo.",
          },
        },
      },
      NOTIFICATIONS: {
        ALIAS: "Notifications",
        KEY: "notifications",
        PATH: "/notifications",
        ICON: <Bell />,
        ICON_ON: <Bell weight="fill" />,
        DESCRIPTION: "Manage notification preferences and alerts.",
        CHILDREN: {
          EMAIL_NOTIFICATIONS: {
            ALIAS: "Email Notifications",
            KEY: "email_notifications",
            PATH: "/email",
            ICON: <Envelope />,
            ICON_ON: <Envelope weight="fill" />,
            DESCRIPTION: "Manage which email notifications you receive.",
          },
          SYSTEM_NOTIFICATIONS: {
            ALIAS: "System Notifications",
            KEY: "system_notifications",
            PATH: "/system",
            ICON: <BellRinging />,
            ICON_ON: <BellRinging weight="fill" />,
            DESCRIPTION: "Configure in-app notification preferences.",
          },
        },
      },
      SECURITY: {
        ALIAS: "Security",
        KEY: "security",
        PATH: "/security",
        ICON: <LockKey />,
        ICON_ON: <LockKey weight="fill" />,
        DESCRIPTION: "Update security settings and access controls.",
        CHILDREN: {
          PASSWORD: {
            ALIAS: "Password",
            KEY: "password",
            PATH: "/password",
            ICON: <Password />,
            ICON_ON: <Password weight="fill" />,
            DESCRIPTION: "Update your password and security questions.",
          },
          TWO_FACTOR: {
            ALIAS: "Two-Factor Authentication",
            KEY: "two_factor",
            PATH: "/two-factor",
            ICON: <ShieldCheck />,
            ICON_ON: <ShieldCheck weight="fill" />,
            DESCRIPTION: "Add an extra layer of security to your account.",
          },
          LOGIN_HISTORY: {
            ALIAS: "Login History",
            KEY: "login_history",
            PATH: "/login-history",
            ICON: <ClockCounterClockwise />,
            ICON_ON: <ClockCounterClockwise weight="fill" />,
            DESCRIPTION: "View your recent login sessions.",
          },
        },
      },
      ADVANCED: {
        ALIAS: "Advanced",
        KEY: "advanced",
        PATH: "/advanced",
        ICON: <Wrench />,
        ICON_ON: <Wrench weight="fill" />,
        DESCRIPTION: "Configure advanced system settings and tools.",
        CHILDREN: {
          DATA_EXPORT: {
            ALIAS: "Data Export",
            KEY: "data_export",
            PATH: "/export",
            ICON: <Download />,
            ICON_ON: <Download weight="fill" />,
            DESCRIPTION: "Download your data in various formats.",
          },
          API_ACCESS: {
            ALIAS: "API Access",
            KEY: "api_access",
            PATH: "/api",
            ICON: <Code />,
            ICON_ON: <Code weight="fill" />,
            DESCRIPTION: "Manage API keys and access credentials.",
          },
          DELETE_ACCOUNT: {
            ALIAS: "Delete Account",
            KEY: "delete_account",
            PATH: "/delete",
            ICON: <Trash />,
            ICON_ON: <Trash weight="fill" />,
            DESCRIPTION:
              "Permanently delete your account and all associated data.",
          },
        },
      },
      INFO: {
        ALIAS: "Info",
        PATH: "/info",
        KEY: "info",
        ICON: <Info />,
        ICON_ON: <Info weight="fill" />,
        DESCRIPTION:
          "Access system information, documentation and help resources.",
      },
    },
  },
  PATCH: {
    ALIAS: "Patch",
    PATH: "/patch",
    KEY: "patch",
    ICON: <RocketLaunch />,
    ICON_ON: <RocketLaunch weight="fill" />,
    DESCRIPTION: "Global Patch View",
  },
} as const;
