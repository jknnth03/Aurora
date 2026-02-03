import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";
import { Controller, useForm } from "react-hook-form";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useSnackbar } from "notistack";
import AuroraSpinner from "../../../components/ui/aurora-spinner/aurora-spinner";
import Input from "../../../components/ui/input/input";
import { useLazyGetOneChargingsUnpaginatedQuery } from "../../../features/api/aurora/masterlist/one-charging.api";
import { useLazyGetRolesUnpaginatedQuery } from "../../../features/api/aurora/masterlist/role.api";
import { useLazyGetEmployeesQuery } from "../../../features/api/aurora/masterlist/sedar-employees.api";
import {
  useCreateUserMutation,
  useGetUserQuery,
  useUpdateUserMutation,
} from "../../../features/api/aurora/masterlist/user.api";
import {
  ApiError,
  isApiErrorResponse,
} from "../../../features/api/aurora/types/types";
import { ApiErrorResponse } from "../../../features/api/aurora/types/types";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import { getInitials } from "../../../utils/avatar";
import { userPayloadSchema, UserPayloadSchema } from "./user.schema";
import { useOpenCreate } from "../../../hooks/useOpenCreate";

export interface UserFormHandle {
  submitForm: () => Promise<void>;
  resetForm: () => void;
  isLoading: boolean;
}

const Loader = () => (
  <AuroraSpinner
    size={14}
    primaryColor="var(--mui-palette-text-secondary)"
    secondaryColor="var(--mui-palette-text-secondary)"
  />
);

interface UserFormProps {
  isEditMode: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const findOptionById = <T extends { id: string | number }>(
  options: T[],
  id: string | number
): T | null => {
  return options.find((option) => option.id === id) || null;
};

const UserForm = forwardRef<UserFormHandle, UserFormProps>(
  ({ isEditMode, onSuccess, onCancel }, ref) => {
    const { enqueueSnackbar } = useSnackbar();

    const { currentParams } = useRememberQueryParams();

    const { close: closeUpdate } = useOpenCreate();

    const [getEmployees, { data: cedarData, isLoading: isLoadingEmployees }] =
      useLazyGetEmployeesQuery();

    const { data: userData, isLoading: isLoadingUser } = useGetUserQuery(
      currentParams.id,
      {
        skip: !isEditMode || !currentParams.id,
      }
    );

    const [getRoles, { data: rolesResponse, isLoading: isLoadingRoles }] =
      useLazyGetRolesUnpaginatedQuery();

    const [
      getOneChargings,
      { data: oneChargingResponse, isLoading: isLoadingOneCharging },
    ] = useLazyGetOneChargingsUnpaginatedQuery();

    const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

    const isLoading = isCreating || isUpdating;

    const rolesData = rolesResponse?.data || [];
    const oneChargingData = oneChargingResponse?.data || [];

    const getUserRoleOption = () => {
      if (isEditMode && userData?.data?.role) {
        return {
          id: userData.data.role.id,
          label: userData.data.role.name,
          data: userData.data.role,
        };
      }
      return null;
    };

    const getUserOneChargingOption = () => {
      if (isEditMode && userData?.data?.one_charging) {
        const oneCharging = userData.data.one_charging;
        return {
          id: oneCharging.id,
          label: `[${oneCharging.code}] - ${oneCharging.name}`,
          data: oneCharging,
        };
      }
      return null;
    };

    const defaultValues = React.useMemo<UserPayloadSchema>(() => {
      if (isEditMode && userData?.data) {
        const user = userData.data;
        return {
          personal_info: {
            id_prefix: user.id_prefix || "",
            id_no: user.id_no || "",
            first_name: user.first_name || "",
            middle_name: user.middle_name || "",
            last_name: user.last_name || "",
            suffix: user.suffix || "",
            mobile_number: user.mobile_number || "",
            gender: user.gender || "male",
            one_charging_id: user.one_charging?.id || 0,
          },
          username: user.username || "",
          role_id: user.role?.id || 0,
        };
      }

      return {
        personal_info: {
          id_prefix: "",
          id_no: "",
          first_name: "",
          middle_name: "",
          last_name: "",
          suffix: "",
          mobile_number: "",
          gender: "male",
          one_charging_id: 0,
        },
        username: "",
        role_id: 0,
      };
    }, [isEditMode, userData]);

    const {
      control,
      handleSubmit,
      reset,
      setValue,
      watch,
      formState: { errors, isDirty },
    } = useForm<UserPayloadSchema>({
      resolver: zodResolver(userPayloadSchema),
      defaultValues,
    });

    useEffect(() => {
      if (isEditMode && userData?.data) {
        const user = userData.data;
        reset({
          personal_info: {
            id_prefix: user.id_prefix || "",
            id_no: user.id_no || "",
            first_name: user.first_name || "",
            middle_name: user.middle_name || "",
            last_name: user.last_name || "",
            suffix: user.suffix || "",
            mobile_number: user.mobile_number || "",
            gender: user.gender || "male",
            one_charging_id: user.one_charging?.id || 0,
          },
          username: user.username || "",
          role_id: user.role?.id || 0,
        });
      }
    }, [isEditMode, userData, reset]);

    const currentIdNo = watch("personal_info.id_no");
    const selectedOneChargingId = watch("personal_info.one_charging_id");

    const selectedEmployee =
      cedarData?.data?.find(
        (item) => item.general_info?.id_number === currentIdNo
      ) || null;

    const selectedOneCharging =
      isEditMode && userData?.data?.one_charging
        ? userData.data.one_charging
        : oneChargingData.find((item) => item.id === selectedOneChargingId) ||
          null;

    const createUserHandler = useCallback(
      async (data: UserPayloadSchema) => {
        const response = await createUser(data).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "User Created successfully!",
        });
        onSuccess?.();
      },
      [createUser, enqueueSnackbar, onSuccess]
    );

    const updateUserHandler = useCallback(
      async (data: UserPayloadSchema) => {
        if (!currentParams.id)
          throw new Error("No user ID provided for update");
        const response = await updateUser({
          id: currentParams.id,
          body: {
            personal_info: {
              mobile_number: data.personal_info.mobile_number || "",
              one_charging_id: data.personal_info.one_charging_id,
            },
            username: data.username,
            role_id: data.role_id,
          },
        }).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "User updated successfully!",
        });
        onSuccess?.();
      },
      [updateUser, currentParams.id, enqueueSnackbar, onSuccess]
    );

    const handleUserSubmit = useCallback(
      async (data: UserPayloadSchema) => {
        if (isEditMode && !isDirty) {
          enqueueSnackbar({
            variant: "warning",
            message: "No changes.",
          });
          return; // Exit early without making API call
        }

        try {
          if (isEditMode) {
            await updateUserHandler(data);
          } else {
            await createUserHandler(data);
          }
          closeUpdate();
        } catch (error: ApiErrorResponse | unknown) {
          if (isApiErrorResponse(error))
            error?.data?.errors.forEach((err: ApiError) => {
              enqueueSnackbar({ variant: "error", message: err.detail });
            });
          throw error;
        }
      },
      [
        isEditMode,
        isDirty,
        closeUpdate,
        updateUserHandler,
        createUserHandler,
        enqueueSnackbar,
      ]
    );

    const submitForm = useCallback(async (): Promise<void> => {
      if (isEditMode && !isDirty) {
        enqueueSnackbar({
          variant: "warning",
          message: "No changes.",
        });
        return Promise.resolve(); // Return resolved promise without API call
      }

      return new Promise<void>((resolve, reject) => {
        const onSubmitWrapper = async (data: UserPayloadSchema) => {
          try {
            await handleUserSubmit(data);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        handleSubmit(onSubmitWrapper)();
      });
    }, [handleSubmit, handleUserSubmit, isEditMode, isDirty, enqueueSnackbar]);

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

    const onSubmit = async (data: UserPayloadSchema) => {
      if (isEditMode && !isDirty) {
        enqueueSnackbar({
          variant: "warning",
          message: "No changes.",
        });
        return; // Exit early without making API call
      }

      try {
        await handleUserSubmit(data);
      } catch (error: unknown) {}
    };

    const oneChargingOptions = oneChargingData.map((item) => ({
      id: item.id,
      label: `[${item.code}] - ${item.name} `,
      data: item,
    }));

    const rolesOptions = rolesData.map((item) => ({
      id: item.id,
      label: item.name,
      data: item,
    }));

    const genderOptions = [
      { id: "male", name: "Male", label: "Male" },
      { id: "female", name: "Female", label: "Female" },
      { id: "other", name: "Other", label: "Other" },
    ];

    if (isEditMode && isLoadingUser) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <Box display={"flex"}>
            <AuroraSpinner />
          </Box>
        </Box>
      );
    }

    return (
      <>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 1 }}
        >
          <Grid container spacing={2}>
            {/* Personal Information */}
            <Grid size={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Account Information
              </Typography>
            </Grid>

            {/* Employee Selection - Only show in create mode */}
            {!isEditMode && (
              <Grid size={12}>
                <FormControl fullWidth>
                  <Autocomplete
                    options={cedarData?.data ?? []}
                    getOptionLabel={(option) =>
                      option.general_info?.full_id_number_full_name || ""
                    }
                    value={selectedEmployee ?? undefined}
                    onChange={(_, newValue) => {
                      if (newValue?.general_info) {
                        const info = newValue.general_info;
                        setValue(
                          "personal_info.id_prefix",
                          info.prefix_id || ""
                        );
                        setValue("personal_info.id_no", info.id_number || "");
                        setValue(
                          "personal_info.first_name",
                          info.first_name || ""
                        );
                        setValue(
                          "personal_info.middle_name",
                          info.middle_name || ""
                        );
                        setValue(
                          "personal_info.last_name",
                          info.last_name || ""
                        );
                        setValue("personal_info.suffix", info.suffix || "");
                        setValue(
                          "personal_info.mobile_number",
                          info.contact_details.replace(/[\s-]/g, "") || ""
                        );
                        setValue(
                          "personal_info.gender",
                          info.gender?.toLowerCase() || "male"
                        );
                        setValue(
                          "username",
                          (
                            getInitials(info?.first_name || "") +
                            (info?.last_name || "")
                          )
                            .replace(/\s/g, "")
                            .toLowerCase() || ""
                        );
                      } else {
                        setValue("personal_info.id_prefix", "");
                        setValue("personal_info.id_no", "");
                        setValue("personal_info.first_name", "");
                        setValue("personal_info.middle_name", "");
                        setValue("personal_info.last_name", "");
                        setValue("personal_info.suffix", "");
                        setValue("personal_info.mobile_number", "");
                        setValue("personal_info.gender", "male");
                      }
                    }}
                    onOpen={() => {
                      if (!cedarData?.data?.length) {
                        getEmployees({}, true);
                      }
                    }}
                    loading={isLoadingEmployees}
                    loadingText="Loading employees..."
                    noOptionsText="No employees found"
                    renderInput={(params) => (
                      <Input
                        {...params}
                        label="Select Employee"
                        size="small"
                        required
                        endIcon={isLoadingEmployees ? <Loader /> : <></>}
                        slotProps={{
                          input: {
                            ...params.InputProps,
                          },
                        }}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
            )}

            <Grid size={6}>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Username"
                    fullWidth
                    variant="outlined"
                    required
                    error={!!errors.username}
                    helperText={errors.username?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="role_id"
                control={control}
                render={({ field }) => {
                  const userRoleOption = getUserRoleOption();
                  const allRoleOptions =
                    isEditMode && userRoleOption
                      ? [
                          userRoleOption,
                          ...rolesOptions.filter(
                            (role) => role.id !== userRoleOption.id
                          ),
                        ]
                      : rolesOptions;

                  return (
                    <FormControl fullWidth error={!!errors.role_id}>
                      <Autocomplete
                        options={allRoleOptions}
                        getOptionLabel={(option) => option.label}
                        value={
                          findOptionById(allRoleOptions, field.value) || null
                        }
                        onChange={(_, newValue) => {
                          field.onChange(newValue ? newValue.id : 0);
                        }}
                        onOpen={() => {
                          if (!rolesData.length) {
                            getRoles({});
                          }
                        }}
                        loading={isLoadingRoles}
                        loadingText="Loading roles..."
                        noOptionsText="No roles found"
                        renderInput={(params) => (
                          <Input
                            {...params}
                            label="Role"
                            size="small"
                            error={!!errors.role_id}
                            helperText={errors.role_id?.message}
                            required
                            endIcon={isLoadingRoles ? <Loader /> : <></>}
                            slotProps={{
                              input: {
                                ...params.InputProps,
                              },
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  );
                }}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="personal_info.id_prefix"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="ID Prefix"
                    fullWidth
                    variant="outlined"
                    disabled
                    error={!!errors.personal_info?.id_prefix}
                    helperText={errors.personal_info?.id_prefix?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="personal_info.id_no"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="ID Number"
                    fullWidth
                    variant="outlined"
                    disabled
                    error={!!errors.personal_info?.id_no}
                    helperText={errors.personal_info?.id_no?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="personal_info.first_name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="First Name"
                    fullWidth
                    variant="outlined"
                    disabled={isEditMode}
                    error={!!errors.personal_info?.first_name}
                    helperText={errors.personal_info?.first_name?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="personal_info.middle_name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Middle Name"
                    fullWidth
                    variant="outlined"
                    disabled={isEditMode}
                    error={!!errors.personal_info?.middle_name}
                    helperText={errors.personal_info?.middle_name?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="personal_info.last_name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Last Name"
                    fullWidth
                    variant="outlined"
                    disabled={isEditMode}
                    error={!!errors.personal_info?.last_name}
                    helperText={errors.personal_info?.last_name?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="personal_info.suffix"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Suffix"
                    fullWidth
                    variant="outlined"
                    disabled={isEditMode}
                    error={!!errors.personal_info?.suffix}
                    helperText={errors.personal_info?.suffix?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="personal_info.mobile_number"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Mobile Number"
                    fullWidth
                    variant="outlined"
                    error={!!errors.personal_info?.mobile_number}
                    helperText={errors.personal_info?.mobile_number?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="personal_info.gender"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.personal_info?.gender}>
                    <Autocomplete
                      options={genderOptions}
                      getOptionLabel={(option) => option.name}
                      value={findOptionById(genderOptions, field.value) || null}
                      onChange={(_, newValue) => {
                        field.onChange(newValue ? newValue.id : "male");
                      }}
                      disabled={isEditMode}
                      renderInput={(params) => (
                        <Input
                          {...params}
                          label="Gender"
                          size="small"
                          error={!!errors.personal_info?.gender}
                          helperText={errors.personal_info?.gender?.message}
                          slotProps={{
                            input: {
                              ...params.InputProps,
                            },
                          }}
                        />
                      )}
                    />
                  </FormControl>
                )}
              />
            </Grid>

            {/* Organization Information */}
            <Grid size={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Organization Information
              </Typography>
            </Grid>

            {/* One Charging Selection */}
            <Grid size={12}>
              <Controller
                name="personal_info.one_charging_id"
                control={control}
                render={({ field }) => {
                  const userOneChargingOption = getUserOneChargingOption();
                  const allOneChargingOptions =
                    isEditMode && userOneChargingOption
                      ? [
                          userOneChargingOption,
                          ...oneChargingOptions.filter(
                            (option) => option.id !== userOneChargingOption.id
                          ),
                        ]
                      : oneChargingOptions;

                  return (
                    <FormControl
                      fullWidth
                      error={!!errors.personal_info?.one_charging_id}
                    >
                      <Autocomplete
                        options={allOneChargingOptions}
                        getOptionLabel={(option) => option.label}
                        value={
                          findOptionById(allOneChargingOptions, field.value) ||
                          null
                        }
                        onChange={(_, newValue) => {
                          field.onChange(newValue ? newValue.id : 0);
                        }}
                        onOpen={() => {
                          if (!oneChargingData.length) {
                            getOneChargings({});
                          }
                        }}
                        loading={isLoadingOneCharging}
                        loadingText="Loading one charging options..."
                        noOptionsText="No one charging options found"
                        renderInput={(params) => (
                          <Input
                            {...params}
                            label="One Charging"
                            size="small"
                            error={!!errors.personal_info?.one_charging_id}
                            helperText={
                              errors.personal_info?.one_charging_id?.message
                            }
                            required
                            endIcon={isLoadingOneCharging ? <Loader /> : <></>}
                            slotProps={{
                              input: {
                                ...params.InputProps,
                              },
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  );
                }}
              />
            </Grid>

            {/* Display selected organization info */}
            <Grid size={6}>
              <Input
                label="Company"
                fullWidth
                variant="outlined"
                disabled
                value={selectedOneCharging?.company_name || ""}
              />
            </Grid>

            <Grid size={6}>
              <Input
                label="Business Unit"
                fullWidth
                variant="outlined"
                disabled
                value={selectedOneCharging?.business_unit_name || ""}
              />
            </Grid>

            <Grid size={6}>
              <Input
                label="Department"
                fullWidth
                variant="outlined"
                disabled
                value={selectedOneCharging?.department_name || ""}
              />
            </Grid>

            <Grid size={6}>
              <Input
                label="Unit"
                fullWidth
                variant="outlined"
                disabled
                value={selectedOneCharging?.department_unit_name || ""}
              />
            </Grid>

            <Grid size={6}>
              <Input
                label="Sub Unit"
                fullWidth
                variant="outlined"
                disabled
                value={selectedOneCharging?.sub_unit_name || ""}
              />
            </Grid>

            <Grid size={6}>
              <Input
                label="Location"
                fullWidth
                variant="outlined"
                disabled
                value={selectedOneCharging?.location_name || ""}
              />
            </Grid>

            <Grid size={12} sx={{ mt: 2 }}>
              {!ref && (
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={onCancel ? onCancel : () => reset(defaultValues)}
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
                      "Update User"
                    ) : (
                      "Create User"
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

export default UserForm;
