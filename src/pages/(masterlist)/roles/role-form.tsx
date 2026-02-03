import { zodResolver } from "@hookform/resolvers/zod";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { useSnackbar } from "notistack";
import AuroraSpinner from "../../../components/ui/aurora-spinner/aurora-spinner";
import Input from "../../../components/ui/input/input";
import { MODULES, TModule } from "../../../config/modules/modules";
import {
  useCreateRoleMutation,
  useGetRoleQuery,
  useUpdateRoleMutation,
} from "../../../features/api/aurora/masterlist/role.api";
import {
  ApiError,
  isApiErrorResponse,
} from "../../../features/api/aurora/types/types";
import { ApiErrorResponse } from "../../../features/api/aurora/types/types";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";

// Define the role form schema
const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required").trim(),
  access_permission: z
    .array(z.string())
    .min(1, "At least one permission is required"),
});

// Define the role form data type
export type RoleFormData = z.infer<typeof roleFormSchema>;

// Define the ref handle methods interface
export interface RoleFormHandle {
  submitForm: () => Promise<void>;
  resetForm: () => void;
  isLoading: boolean;
}

interface RoleFormProps {
  isEditMode: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Define permission options from the MODULES
export interface PermissionOption extends TModule {
  KEY: string;
  MODULE: string;
}

const RoleForm = forwardRef<RoleFormHandle, RoleFormProps>(
  ({ isEditMode, onSuccess, onCancel }, ref) => {
    const { enqueueSnackbar } = useSnackbar();
    const { currentParams } = useRememberQueryParams();
    const { close: closeCreate } = useOpenCreate();

    const { data: roleData, isLoading: isLoadingRole } = useGetRoleQuery(
      currentParams.id,
      {
        skip: !isEditMode || !currentParams.id,
      }
    );

    // RTK Query mutations
    const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
    const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

    const isLoading = isCreating || isUpdating;

    // Generate permission options from MODULES
    const permissionOptions = useMemo<PermissionOption[]>(() => {
      const options: PermissionOption[] = [];

      // Process all top-level modules
      Object.entries(MODULES).forEach(([_moduleKey, module]) => {
        const moduleName = module.ALIAS;

        // If module has children, add them as permissions
        if (module.CHILDREN && Object.keys(module.CHILDREN).length > 0) {
          Object.values(module.CHILDREN).forEach((childModule) => {
            if (childModule.KEY) {
              options.push({
                KEY: childModule.KEY,
                ALIAS: childModule.ALIAS,
                MODULE: moduleName,
                ICON: childModule.ICON,
                ICON_ON: childModule.ICON_ON,
                PATH: childModule.PATH,
              });
            }
          });
        }
        // If module has no children, add the module itself as a permission
        else if (
          module.KEY &&
          module.KEY !== "login" &&
          module.KEY !== "signup"
        ) {
          options.push({
            KEY: module.KEY,
            ALIAS: module.ALIAS,
            MODULE: "Main Modules",
            ICON: module.ICON,
            ICON_ON: module.ICON_ON,
            PATH: module.PATH,
          });
        }
      });

      return options;
    }, []);

    // Create a key-to-label mapping for display
    const keyToLabelMap = useMemo(() => {
      const map: Record<string, string> = {};
      permissionOptions.forEach((option) => {
        map[option?.KEY] = option.ALIAS;
      });
      return map;
    }, [permissionOptions]);

    // Set up form with default values
    const defaultValues = useMemo<RoleFormData>(() => {
      if (isEditMode && roleData?.data) {
        const role = roleData.data;
        return {
          name: role.name || "",
          access_permission: role.access_permission || [],
        };
      }

      return {
        name: "",
        access_permission: [],
      };
    }, [isEditMode, roleData]);

    const {
      control,
      handleSubmit,
      reset,
      formState: { errors, isDirty },
    } = useForm<RoleFormData>({
      resolver: zodResolver(roleFormSchema),
      defaultValues,
    });

    useEffect(() => {
      if (isEditMode && roleData?.data) {
        const role = roleData.data;
        reset({
          name: role.name || "",
          access_permission: role.access_permission || [],
        });
      }
    }, [isEditMode, roleData, reset]);

    const createRoleHandler = useCallback(
      async (data: RoleFormData) => {
        const response = await createRole(data).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Role created successfully!",
        });
        onSuccess?.();
      },
      [createRole, enqueueSnackbar, onSuccess]
    );

    const updateRoleHandler = useCallback(
      async (data: RoleFormData) => {
        if (!currentParams.id)
          throw new Error("No role ID provided for update");
        const response = await updateRole({
          id: currentParams.id,
          body: data,
        }).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Role updated successfully!",
        });
        onSuccess?.();
      },
      [updateRole, currentParams.id, enqueueSnackbar, onSuccess]
    );

    const handleRoleSubmit = useCallback(
      async (data: RoleFormData) => {
        if (isEditMode && !isDirty) {
          enqueueSnackbar({
            variant: "warning",
            message: "No changes.",
          });
          return;
        }

        try {
          if (isEditMode) {
            await updateRoleHandler(data);
          } else {
            await createRoleHandler(data);
          }
          closeCreate();
        } catch (error: ApiErrorResponse | unknown) {
          if (isApiErrorResponse(error)) {
            error?.data?.errors.forEach((err: ApiError) => {
              enqueueSnackbar({ variant: "error", message: err.detail });
            });
          }
          throw error;
        }
      },
      [
        isEditMode,
        isDirty,
        updateRoleHandler,
        createRoleHandler,
        enqueueSnackbar,
        closeCreate,
      ]
    );

    const submitForm = useCallback(async (): Promise<void> => {
      if (isEditMode && !isDirty) {
        enqueueSnackbar({
          variant: "warning",
          message: "No changes.",
        });
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const onSubmitWrapper = async (data: RoleFormData) => {
          try {
            await handleRoleSubmit(data);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        handleSubmit(onSubmitWrapper)();
      });
    }, [handleSubmit, handleRoleSubmit, isEditMode, isDirty, enqueueSnackbar]);

    const resetForm = useCallback(() => {
      reset(defaultValues);
    }, [reset, defaultValues]);

    useImperativeHandle(
      ref,
      () => ({
        submitForm,
        resetForm,
        isLoading,
      }),
      [submitForm, resetForm, isLoading]
    );

    // Group permissions by module
    const permissionsByModule = useMemo(() => {
      const grouped: Record<string, PermissionOption[]> = {};

      permissionOptions.forEach((option) => {
        if (!grouped[option.MODULE]) {
          grouped[option.MODULE] = [];
        }
        grouped[option.MODULE].push(option);
      });

      // Sort the modules to ensure "Main Modules" appears first
      return Object.entries(grouped)
        .sort(([a], [b]) => {
          if (a === "Main Modules") return -1;
          if (b === "Main Modules") return 1;
          return a.localeCompare(b);
        })
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, PermissionOption[]>);
    }, [permissionOptions]);

    // Handle loading state for edit mode
    if (isEditMode && isLoadingRole) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <Box display="flex">
            <AuroraSpinner />
          </Box>
        </Box>
      );
    }

    return (
      <>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            {/* Role Information */}
            <Grid size={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Role Information
              </Typography>
            </Grid>

            <Grid size={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Role Name"
                    fullWidth
                    variant="outlined"
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="access_permission"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.access_permission}>
                    <InputLabel sx={{ top: -7 }} id="permissions-label">
                      Permissions
                    </InputLabel>
                    <Select
                      size="small"
                      {...field}
                      labelId="permissions-label"
                      label="Permissions"
                      required
                      multiple
                      disabled={isLoading}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((key) => {
                            return (
                              <Chip
                                key={key}
                                label={keyToLabelMap[key] || key}
                                size="small"
                                variant="outlined"
                                color="primary"
                                onDelete={(e) => {
                                  e.stopPropagation();
                                  const newValue = field.value.filter(
                                    (item) => item !== key
                                  );
                                  field.onChange(newValue);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                disabled={isLoading}
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {Object.entries(permissionsByModule)
                        .map(([module, options]) => {
                          return [
                            <MenuItem key={module} disabled divider>
                              <Typography variant="subtitle2">
                                {module}
                              </Typography>
                            </MenuItem>,
                            ...options.map((option) => (
                              <MenuItem key={option.KEY} value={option.KEY}>
                                <Checkbox
                                  checkedIcon={option.ICON_ON}
                                  icon={option.ICON}
                                  checked={field.value.includes(option.KEY)}
                                />
                                <ListItemText primary={option.ALIAS} />
                              </MenuItem>
                            )),
                          ];
                        })
                        .flat()}
                    </Select>
                    {errors.access_permission && (
                      <FormHelperText>
                        {errors.access_permission.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={12} sx={{ mt: 2 }}>
              {!ref && (
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={onCancel ? onCancel : () => reset(defaultValues)}
                    disabled={isLoading}
                  >
                    {onCancel ? "Cancel" : "Reset"}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={
                      isCreating || isUpdating || (!isDirty && isEditMode)
                    }
                  >
                    {isCreating || isUpdating ? (
                      <CircularProgress size={24} />
                    ) : isEditMode ? (
                      "Update Role"
                    ) : (
                      "Create Role"
                    )}
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </>
    );
  }
);

export default RoleForm;
