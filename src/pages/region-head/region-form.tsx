import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import AuroraSpinner from "../../../components/ui/aurora-spinner/aurora-spinner";
import Input from "../../../components/ui/input/input";
import {
  ApiError,
  ApiErrorResponse,
  isApiErrorResponse,
} from "../../../features/api/aurora/types/types";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import { regionSchema } from "./region.schema";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import {
  RegionPayloadSchema,
  RegionSchema,
  useCreateRegionMutation,
  useGetRegionQuery,
  useUpdateRegionMutation,
} from "../../../features/api/aurora/masterlist/regions.api";
import TextField from "@mui/material/TextField";
import { useLazyGetUsersQuery } from "../../../features/api/aurora/masterlist/user.api";

export interface RegionFormHandle {
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

interface RegionFormProps {
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

const RegionForm = forwardRef<RegionFormHandle, RegionFormProps>(
  ({ isEditMode, onSuccess, onCancel }, ref) => {
    const { enqueueSnackbar } = useSnackbar();

    const { currentParams } = useRememberQueryParams();

    const { close: closeUpdate } = useOpenCreate();

    const { data: regionData, isLoading: isLoadingRegion } = useGetRegionQuery(
      currentParams.id,
      {
        skip: !isEditMode || !currentParams.id,
      }
    );

    const [getUsers, { isLoading: isLoadingUsers }] = useLazyGetUsersQuery();

    const [createRegion, { isLoading: isCreating }] = useCreateRegionMutation();
    const [updateRegion, { isLoading: isUpdating }] = useUpdateRegionMutation();

    const isLoading =
      isCreating || isUpdating || isLoadingRegion || isLoadingUsers;

    const setFormValues = useCallback(() => {
      if (isEditMode && regionData?.data) {
        const region = regionData.data;
        setValue("name", region.name);
        setValue("region_head.id", region.region_head.id);
        setValue("region_head.full_name", region.region_head.full_name);
      } else {
        reset();
      }
    }, [isEditMode, regionData]);

    useEffect(() => {
      setFormValues();
    }, [setFormValues]);

    const {
      control,
      handleSubmit,
      reset,
      setValue,
      watch,
      formState: { errors, isDirty },
    } = useForm({
      resolver: zodResolver(regionSchema),
      criteriaMode: "all",
      mode: "onChange",
    });
    // useEffect(() => {
    //   if (isEditMode && userData?.data) {
    //     const user = userData.data;
    //     reset({
    //       personal_info: {
    //         id_prefix: user.id_prefix || "",
    //         id_no: user.id_no || "",
    //         first_name: user.first_name || "",
    //         middle_name: user.middle_name || "",
    //         last_name: user.last_name || "",
    //         suffix: user.suffix || "",
    //         mobile_number: user.mobile_number || "",
    //         gender: user.gender || "male",
    //         one_charging_id: user.one_charging?.id || 0,
    //       },
    //       username: user.username || "",
    //       role_id: user.role?.id || 0,
    //     });
    //   }
    // }, [isEditMode, userData, reset]);

    const createRegionHandler = useCallback(
      async (data: RegionPayloadSchema) => {
        const response = await createRegion(data).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Region Created successfully!",
        });
        onSuccess?.();
      },
      [createRegion, enqueueSnackbar, onSuccess]
    );

    const updateRegionHandler = useCallback(
      async (data: RegionPayloadSchema) => {
        if (!currentParams.id)
          throw new Error("No region ID provided for update");
        const response = await updateRegion({
          id: currentParams.id,
          body: {
            name: data.name,
            region_head_id: data.region_head_id,
          },
        }).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Region updated successfully!",
        });
        onSuccess?.();
      },
      [updateRegion, currentParams.id, enqueueSnackbar, onSuccess]
    );

    const handleRegionSubmit = useCallback(
      async (data: RegionPayloadSchema) => {
        if (isEditMode && !isDirty) {
          enqueueSnackbar({
            variant: "warning",
            message: "No changes.",
          });
          return; // Exit early without making API call
        }

        try {
          if (isEditMode) {
            await updateRegionHandler(data);
          } else {
            await createRegionHandler(data);
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
        updateRegionHandler,
        createRegionHandler,
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
        const onSubmitWrapper = async (data: RegionSchema) => {
          const payload: RegionPayloadSchema = {
            name: data.name,
            region_head_id: data.region_head.id,
          };
          try {
            await handleRegionSubmit(payload);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        handleSubmit(onSubmitWrapper)();
      });
    }, [
      handleSubmit,
      handleRegionSubmit,
      isEditMode,
      isDirty,
      enqueueSnackbar,
    ]);
    const resetForm = useCallback(() => {
      reset();
    }, [reset]);

    useImperativeHandle(
      ref,
      () => ({
        submitForm,
        resetForm,
        isLoading,
      }),
      [submitForm, resetForm, isLoading]
    );

    const onSubmit = async (data: RegionSchema) => {
      const payload: RegionPayloadSchema = {
        name: data.name,
        region_head_id: data.region_head.id,
      };
      if (isEditMode && !isDirty) {
        enqueueSnackbar({
          variant: "warning",
          message: "No changes.",
        });
        return; // Exit early without making API call
      }

      try {
        await handleRegionSubmit(payload);
      } catch (error) {}
    };

    const [users, setUsers] = useState<Array<
      RegionSchema["region_head"]
    > | null>(null);
    const [openUsers, setOpenUsers] = useState(false);
    const handleOpenUsers = async () => {
      setOpenUsers(true);
      try {
        const response = await getUsers({ status: "active" }).unwrap();
        setUsers(response.data.data);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.status === 422) {
          enqueueSnackbar(apiError.detail, { variant: "error" });
        } else {
          enqueueSnackbar("An unexpected error has occured", {
            variant: "error",
          });
        }
      }
    };

    const handleCloseUsers = () => {
      setOpenUsers(false);
    };

    if (isEditMode && isLoadingRegion) {
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
            <Grid size={12}>
              <Controller
                name="name"
                control={control}
                render={({ field: { value, ...rest } }) => {
                  return (
                    <Input
                      required
                      {...rest}
                      value={value}
                      fullWidth
                      label="Region name"
                    />
                  );
                }}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="region_head"
                control={control}
                defaultValue={{ full_name: "", id: 0 }}
                render={({ field: { onChange, value, ...rest } }) => {
                  return (
                    <Autocomplete
                      {...rest}
                      value={value || null}
                      onChange={(_, newValue) => {
                        const formData: RegionSchema["region_head"] = {
                          id: newValue?.id || 0,
                          full_name: newValue?.full_name || "",
                        };
                        onChange(formData);
                      }}
                      onOpen={handleOpenUsers}
                      open={openUsers}
                      onClose={handleCloseUsers}
                      options={users || []}
                      loading={isLoadingUsers}
                      getOptionLabel={(option) => option?.full_name || ""}
                      isOptionEqualToValue={(option, value) =>
                        Number(option.id) === Number(value.id)
                      }
                      renderInput={(params) => {
                        return (
                          <Input
                            {...params}
                            label="Region Head"
                            required
                            endIcon={isLoadingUsers ? <Loader /> : <></>}
                            slotProps={{
                              input: {
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {isLoadingUsers ? (
                                      <Box
                                        component="span"
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          mr: 1,
                                        }}
                                      >
                                        <Loader />
                                      </Box>
                                    ) : null}
                                    {params.InputProps?.endAdornment}
                                  </>
                                ),
                              },
                            }}
                          />
                        );
                      }}
                    />
                  );
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </>
    );
  }
);

export default RegionForm;
