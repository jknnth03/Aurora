import { zodResolver } from "@hookform/resolvers/zod";
import {
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
import { areaSchema } from "./area.schema";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import {
  IRegionResponse,
  useLazyGetRegionsQuery,
} from "../../../features/api/aurora/masterlist/regions.api";
import {
  AreaPayloadSchema,
  AreaSchema,
  useCreateAreaMutation,
  useGetAreaQuery,
  useUpdateAreaMutation,
} from "../../../features/api/aurora/masterlist/areas.api";
import {
  IUserResponse,
  useLazyGetUsersQuery,
} from "../../../features/api/aurora/masterlist/user.api";

export interface AreaFormHandle {
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

interface AreaFormProps {
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

const AreaForm = forwardRef<AreaFormHandle, AreaFormProps>(
  ({ isEditMode, onSuccess, onCancel }, ref) => {
    const { enqueueSnackbar } = useSnackbar();

    const { currentParams } = useRememberQueryParams();

    const { close: closeUpdate } = useOpenCreate();

    const { data: areaData, isLoading: isLoadingArea } = useGetAreaQuery(
      currentParams.id,
      {
        skip: !isEditMode || !currentParams.id,
      }
    );

    const [getUsers, { isLoading: isLoadingUsers }] = useLazyGetUsersQuery();
    const [getRegions, { isLoading: isLoadingRegions }] =
      useLazyGetRegionsQuery();
    const [createArea, { isLoading: isCreating }] = useCreateAreaMutation();
    const [updateArea, { isLoading: isUpdating }] = useUpdateAreaMutation();

    const isLoading =
      isCreating || isUpdating || isLoadingArea || isLoadingUsers;

    const setFormValues = useCallback(() => {
      if (isEditMode && areaData?.data) {
        const area = areaData.data;
        setValue("name", area.name);
        setValue("area_head.id", area.area_head.id);
        setValue("area_head.full_name", area.area_head.full_name);
        setValue("area_head.user_status", area.area_head.user_status);
        setValue("region.id", area.region.id);
        setValue("region.name", area.region.name);
      } else {
        reset();
      }
    }, [isEditMode, areaData]);

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
      resolver: zodResolver(areaSchema),
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

    const createAreaHandler = useCallback(
      async (data: AreaPayloadSchema) => {
        const response = await createArea(data).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Area Created successfully!",
        });
        onSuccess?.();
      },
      [createArea, enqueueSnackbar, onSuccess]
    );

    const updateAreaHandler = useCallback(
      async (data: AreaPayloadSchema) => {
        if (!currentParams.id)
          throw new Error("No area ID provided for update");
        const response = await updateArea({
          id: currentParams.id,
          body: {
            name: data.name,
            region_id: data.region_id,
            area_head_id: data.area_head_id,
          },
        }).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Region updated successfully!",
        });
        onSuccess?.();
      },
      [updateArea, currentParams.id, enqueueSnackbar, onSuccess]
    );

    const handleAreaSubmit = useCallback(
      async (data: AreaPayloadSchema) => {
        if (isEditMode && !isDirty) {
          enqueueSnackbar({
            variant: "warning",
            message: "No changes.",
          });
          return; // Exit early without making API call
        }

        try {
          if (isEditMode) {
            await updateAreaHandler(data);
          } else {
            await createAreaHandler(data);
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
        updateAreaHandler,
        createAreaHandler,
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
        const onSubmitWrapper = async (data: AreaSchema) => {
          const payload: AreaPayloadSchema = {
            name: data.name,
            region_id: data.region.id,
            area_head_id: data.area_head.id,
          };
          try {
            await handleAreaSubmit(payload);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        handleSubmit(onSubmitWrapper)();
      });
    }, [handleSubmit, handleAreaSubmit, isEditMode, isDirty, enqueueSnackbar]);
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

    const onSubmit = async (data: AreaSchema) => {
      if (isEditMode && !isDirty) {
        enqueueSnackbar({
          variant: "warning",
          message: "No changes.",
        });
        return; // Exit early without making API call
      }
      const payload: AreaPayloadSchema = {
        name: data.name,
        region_id: data.region.id,
        area_head_id: data.area_head.id,
      };
      try {
        await handleAreaSubmit(payload);
      } catch (error) {}
    };

    const [users, setUsers] = useState<Array<IUserResponse> | null>(null);
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

    const [regions, setRegions] = useState<Array<IRegionResponse> | null>(null);
    const [openRegions, setOpenRegions] = useState(false);
    const handleOpenRegions = async () => {
      setOpenRegions(true);
      try {
        const response = await getRegions({ status: "active" }).unwrap();
        setRegions(response.data.data);
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

    const handleCloseRegions = () => {
      setOpenRegions(false);
    };

    if (isEditMode && isLoadingArea) {
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
                      {...rest}
                      value={value}
                      fullWidth
                      required
                      label="Area name"
                    />
                  );
                }}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="region"
                control={control}
                defaultValue={{ id: 0, name: "" }}
                render={({ field: { onChange, value, ...rest } }) => {
                  return (
                    <Autocomplete
                      {...rest}
                      value={value || null}
                      onChange={(_, newValue) => {
                        onChange({ name: newValue?.name, id: newValue?.id });
                      }}
                      onOpen={handleOpenRegions}
                      open={openRegions}
                      onClose={handleCloseRegions}
                      options={regions || []}
                      loading={isLoadingRegions}
                      getOptionLabel={(option) => option?.name || ""}
                      isOptionEqualToValue={(option, value) =>
                        Number(option.id) === Number(value.id)
                      }
                      renderInput={(params) => {
                        return (
                          <Input
                            {...params}
                            label="Region Name"
                            required
                            endIcon={isLoadingRegions ? <Loader /> : <></>}
                            slotProps={{
                              input: {
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {isLoadingRegions ? (
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
            <Grid size={12}>
              <Controller
                name="area_head"
                control={control}
                defaultValue={{ id: 0, full_name: "" }}
                render={({ field: { onChange, value, ...rest } }) => {
                  return (
                    <Autocomplete
                      {...rest}
                      value={value || null}
                      onChange={(_, newValue) => {
                        onChange({
                          id: newValue?.id,
                          full_name: newValue?.full_name,
                        });
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
                            label="Area Head"
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

export default AreaForm;
