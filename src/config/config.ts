import { CheckSquare, Lock, Palette, Scroll } from "@phosphor-icons/react";
import themeGuide from "../assets/markdowns/dark-light-mode-benefits.md?raw";
import qaGuide from "../assets/markdowns/qa-guide.md?raw";
import securePassword from "../assets/markdowns/secure-password.md?raw";
import markdownGuideContent from "../assets/markdowns/markdown-editor-guide.md?raw";
import { MODULES } from "./modules/modules";
import { flattenModules } from "./modules/modulesUtility";

export const LINKS = {
  password: "https://www.cisa.gov/secure-our-world/use-strong-passwords",
};

export const mdParams = {
  passwordMd: {
    name: "Secure Password",
    link: "/info?secure-password",
    markdown: securePassword,
    icon: Lock,
  },
  qaGuide: {
    name: "QA Guide",
    link: "/info?qa-guide",
    markdown: qaGuide,
    icon: CheckSquare,
  },
  theme: {
    name: "Theme Benefits",
    link: "/info?theme-guide",
    markdown: themeGuide,
    icon: Palette,
  },
  // patchNotes: {
  //   name: "Patch Notes",
  //   link: "/info?patch-notes",
  //   markdown: "",
  //   icon: Scroll,
  // },
};

// Create CONFIG with strong typing
export const CONFIG = {
  APP_NAME: "Aurora",
  DESCRIPTIONS: {
    APP: "Aurora is an automated quality assurance system for the TSQA department, built to replace manual QA workflows across meat production, stores, and feed mill operations. It centralizes quality data, supports real-time monitoring, and ensures compliance with regulatory standards. Core functionalities include automated inspections, compliance tracking, error logging, and performance analytics—enabling faster response to quality issues and improved operational accuracy",
    APP_SHORT: "Illuminates TSQA quality assurance.",
    PALETTE_PICKER_TITLE: "PP - Palette Picker",
    PALETTE_PICKER_DESCRIPTION:
      "Dedicated to the MIS Team: A Canvas of Colors for Innovation",
    PALETTE_PICKER_SUBTITLE:
      "This customizable color theme feature is a tribute to the MIS Team's ingenuity and dedication to creating impactful systems. By enabling users to select from a diverse palette of themes, the feature embodies flexibility and creativity—key qualities that define the team. This is more than just an aesthetic enhancement—it's a celebration of the team's ability to transform complexity into intuitive, personalized experiences. Like the array of colors available, the MIS Team’s work empowers users to shine in their unique way while maintaining harmony and efficiency.",
  },
  PREFIX: { dialogPrefix: "dg" },
  SUFFIX: {
    createUser: "user-create",
    finder: "finder",
    theme_picker: "theme-picker",
  },

  TEXTS: {
    LOGIN: {
      label: "Welcome back!",
      description:
        "Your login credentials have been provided by RDF. Please enter your details below.",
    },
    ALTERNATIVE_THEME: {
      label: "Alternative Theme",
      description: "This is the alternative theme.",
    },
  },
  EMPTY_TEXT: "-- -- --",
  DEFAULT_COLOR: "Orange",
  ERRORS: {
    UNEXPECTED: "An unexpected error occurred.",
    LOGIN_FAILED: "Login Failed.",
  },
  COOKIE: {
    SESSION: { LABEL: "SESSION_COOKIE", EXPIRATION: 5 },
  },
  STORAGE: {
    DARK_MODE: { LABEL: "DARK_MODE" },
    SYSTEM_COLOR: { LABEL: "SYSTEM_COLOR" },
    DRAWER: { LABEL: "DRAWER" },
    DIALOG_SIZE: { LABEL: "DIALOG-SIZE" },
  },
  BUTTONS: {
    REMEMBER: {
      name: "remember",
      label: "Remember Me",
      description: "To make the app remember your session",
    },
    CREATE: {
      name: "create",
      label: "Create",
      description: "Click to Create",
    },
    SHOW_DETAILS: {
      name: "show_details",
      label: "Show Details",
      description: "Click to Show Details",
    },
    HIDE_DETAILS: {
      name: "hide_details",
      label: "Hide Details",
      description: "Click to Hide Details",
    },
    SUBMIT: {
      name: "submit",
      label: "Submit",
      description: "Click to submit the form",
    },
    CLOSE: {
      name: "close",
      label: "Close",
      description: "Click to close and discard changes",
    },
    CANCEL: {
      name: "cancel",
      label: "Cancel",
      description: "Click to cancel and discard changes",
    },
    LOGIN: {
      name: "login",
      label: "Log In",
      description: "Click to log into your account",
    },
    SIGNUP: {
      name: "signup",
      label: "Sign Up",
      description: "Click to create a new account",
    },
    SAVE: {
      name: "save",
      label: "Save",
      description: "Click to save your changes",
    },
    DELETE: {
      name: "delete",
      label: "Delete",
      description: "Click to delete the selected item",
    },
    ARCHIVE: {
      name: "archive",
      label: "Archive",
      description: "Click to archive this item",
    },
    RESUBMIT: {
      name: "resubmit",
      label: "Resubmit",
      description: "Click to resubmit the form",
    },
    EDIT: {
      name: "edit",
      label: "Edit",
      description: "Click to edit the item",
    },
    VIEW_CHANGES: {
      name: "view_changes",
      label: "View Changes",
      description: "Click to view changes made",
    },
    SET_VISIBILE: {
      name: "set_visible",
      label: "Input Visibility",
      description: "To hide or show what's hidden",
    },
  },
  SHORTCUTS: {
    CREATE: "ctrl+alt+n",
  },
  FIELDS: {
    EMPLOYEE: {
      name: "employee",
      label: "Employee",
      placeholder: "Select an Employee",
      description: "Employee must be a worker of RDF",
      required: "Employee is required.",
    },
    USERNAME: {
      name: "username",
      label: "Username",
      placeholder: "Enter your username",
      description: "This username was pre-setup by the company.",
      required: "Username is required.",
    },
    PASSWORD: {
      name: "password",
      label: "Password",
      placeholder: "Enter your password",
      description: `Make sure your password is secure to prevent any fraudulent attempts to your account. [[LINK|${mdParams.passwordMd.link}|Click here]] to read more about security.`,
      required: "Password is required.",
    },
    EMAIL: {
      name: "email",
      label: "Email Address",
      placeholder: "Enter your email address",
      description: "Enter a valid email format",
    },
    PHONE: {
      name: "phone",
      label: "Phone Number",
      placeholder: "Enter your phone number",
      description: "Include country code",
    },
    FIRST_NAME: {
      name: "first_name",
      label: "First Name",
      placeholder: "Enter your first name",
      description: "Your given name",
      required: "First name is required.",
    },
    LAST_NAME: {
      name: "last_name",
      label: "Last Name",
      placeholder: "Enter your last name",
      description: "Your family name",
      required: "Last name is required.",
    },
    MIDDLE_NAME: {
      name: "middle_name",
      label: "Middle Name",
      placeholder: "Enter your middle name",
      description: "Your middle name (if applicable)",
    },
    FULL_NAME: {
      name: "full_name",
      label: "Full Name",
      placeholder: "Enter your full name",
      description: "Your complete name (First, Middle, Last)",
    },
    ROLE: {
      name: "name",
      label: "Role",
      placeholder: "Enter YMIR Role",
      description: "Your Ymir Account Role",
      required: "Role is required.",
    },
    ACCESS_PERMISSION: {
      name: "access_permission",
      label: "Permissions",
      placeholder: "Enter Role's Access Permission",
      description: "Role's Access Permission",
      required: "Access Permission are required.",
    },
    POSITION: {
      name: "position",
      label: "Position",
      placeholder: "Enter your Work Position",
      description: "Your Workplace Position/Current Job Role",
      required: "Position is required.",
    },
    ID_NUMBER: {
      name: "id_number",
      label: "ID Number",
      placeholder: "Enter your ID number",
      description: "Your unique identification number",
      required: "ID number is required.",
    },
    COMPANY: {
      name: "company",
      label: "Company",
      placeholder: "Enter your company name",
      description: "The name of your company",
    },
    COMPANY_CODE: {
      name: "company_code",
      label: "Company Code",
      placeholder: "Enter your company Code",
      description: "The code of your company",
    },
    BUSINESS_UNIT: {
      name: "business_unit",
      label: "Business Unit",
      placeholder: "Enter your business unit",
      description: "The business unit you belong to",
    },
    DEPARTMENT: {
      name: "department",
      label: "Department",
      placeholder: "Enter your department",
      description: "The department you belong to",
    },
    DEPARTMENT_UNITS: {
      name: "unit",
      label: "Unit",
      placeholder: "Enter your unit",
      description: "The unit within the department",
    },
    SUB_UNITS: {
      name: "subunit",
      label: "Subunit",
      placeholder: "Enter your subunit",
      description: "The specific subunit or team within the unit",
    },
    LOCATION: {
      name: "location",
      label: "Location",
      placeholder: "Enter your location",
      description: "The physical location or office",
    },
    WAREHOUSE: {
      name: "warehouse",
      label: "Warehouse",
      placeholder: "Enter your Warehouse",
      description: "The physical warehouse or office",
    },
    PREFIX_ID: {
      name: "prefix_id",
      label: "Prefix ID",
      placeholder: "Enter prefix ID",
      description: "A unique identifier prefix",
      required: "Prefix is required.",
    },
    SUFFIX: {
      name: "suffix",
      label: "Suffix",
      placeholder: "Enter suffix",
      description: "Name suffix (e.g., Jr., Sr.)",
    },
    MOBILE_NO: {
      name: "mobile_no",
      label: "Mobile Number",
      placeholder: "Enter your mobile number",
      description: "Your contact number",
    },
    COMPANY_ID: {
      name: "company_id",
      label: "Company ID",
      placeholder: "Enter your company ID",
      description: "The ID of the company",
      required: "Company is required.",
    },
    BUSINESS_UNIT_ID: {
      name: "business_unit_id",
      label: "Business Unit ID",
      placeholder: "Enter your business unit ID",
      description: "The ID of the business unit",
      required: "Business Unit is required.",
    },
    DEPARTMENT_ID: {
      name: "department_id",
      label: "Department ID",
      placeholder: "Enter your department ID",
      description: "The ID of the department",
      required: "Department is required.",
    },
    DEPARTMENT_UNIT_ID: {
      name: "department_unit_id",
      label: "Department Unit ID",
      placeholder: "Enter your department unit ID",
      description: "The ID of the department unit",
      required: "Department Unit is required.",
    },
    SUB_UNIT_ID: {
      name: "sub_unit_id",
      label: "Subunit ID",
      placeholder: "Enter your subunit ID",
      description: "The ID of the subunit",
      required: "Subunit is required.",
    },
    LOCATION_ID: {
      name: "location_id",
      label: "Location ID",
      placeholder: "Enter your location ID",
      description: "The ID of the location",
      required: "Location is required.",
    },
    WAREHOUSE_ID: {
      name: "warehouse_id",
      label: "Warehouse ID",
      placeholder: "Enter your warehouse ID",
      description: "The ID of the warehouse",
      required: "Warehouse is required.",
    },
    ROLE_ID: {
      name: "role_id",
      label: "Role ID",
      placeholder: "Enter your role ID",
      description: "The ID of the user's role",
      required: "Role is required.",
    },
  },
  CHART_OF_ACCOUNTS_KEYS: {
    BUSINESS_UNIT: "business_unit",
    COMPANY: "company",
    DEPARTMENT: "department",
    DEPARTMENT_UNITS: "department_units",
    LOCATION: "location",
    SUB_UNIT: "sub_unit",
  },
  STATUSES: {
    SUCCESS: "Success",
    INACTIVE: "Inactive",
    ACTIVE: "Active",
    FAILURE: "Failure",
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    UPCOMING: "Upcoming",
    RESUBMITTED: "Resubmitted",
    UPDATED: "Updated",
  },
  HEADERS: {
    USERS: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "age", label: "Age" },
    ],
  },
  DATE_FORMAT_DISPLAY: "MMM DD YYYY",
  DATE_FORMAT_INPUT: "YYYY-MM-DD",
  VERSION: 2,
  BASE_URL: import.meta.env.VITE_AURORA_ENDPOINT, // CHANGE ON LOCAL TO SEE FILES. VITE_PROXY_URL FOR LOCAL | VITE_AURORA_ENDPOINT FOR BUILD
  SALT_KEY: import.meta.env.VITE_SALT,
  SECRET_KEY: import.meta.env.VITE_SECRET,
  ENDPOINTS: {
    LOGIN: "/api/login",
    REGISTER: "/api/register",
    FETCH_DASHBOARD: "/api/dashboard",
    USERS: "/users",
    COMPANIES: "/companies",
    BUSINESS_UNITS: "/business-units",
    DEPARTMENTS: "/departments",
    ONE_CHARGING: "/one_charging",
    UNITS: "/units",
    SUBUNITS: "/sub-units",
    LOCATION: "/locations",
    WAREHOUSE: "/warehouse",
    ROLES: "/role",
    // PATCH_NOTES: "/patch_notes",
    SEDAR_EMPLOYEES: "/sedar_employees",
    CHECKLIST: "/checklist",
    STORE: "/store",
    STORE_CHECKLIST: "/store_checklist",
    REGION: "/region",
    AREA: "/area",
    SCORE_RATING: "/rating",
    QA: "/quality_assurance",
    SURVEY_APPROVER: "/approver_dashboard",
    AREA_HEAD: "/region_area_head?user_type=area_head",
    REGION_HEAD: "/region_area_head?user_type=region_head",
  },
  ROUTES: flattenModules(MODULES),
  DEFAULT_MARKDOWN_CONTENT: markdownGuideContent,
  PATCH_BUFFER_LEVEL: 5,
};
