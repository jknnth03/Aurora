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
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import AuroraSpinner from "../../../components/ui/aurora-spinner/aurora-spinner";
import Input from "../../../components/ui/input/input";
import { ApiError } from "../../../features/api/aurora/types/types";
import ApiErrorResponse from "../../../features/api/aurora/types/types";
import { isApiErrorResponse } from "../../../features/api/aurora/types/types";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import { storeSchema, StoreSchema } from "./store.schema";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import { useGetChecklistQuery } from "../../../features/api/aurora/masterlist/checklist.api";
import {
  StorePayloadSchema,
  useCreateStoreMutation,
  useGetStoreQuery,
  useUpdateStoreMutation,
} from "../../../features/api/aurora/masterlist/store.api";
import {
  IRegionResponse,
  useLazyGetUnpaginatedRegionsQuery,
} from "../../../features/api/aurora/masterlist/regions.api";
import {
  IAreaResponse,
  useLazyGetUnpaginatedAreasQuery,
} from "../../../features/api/aurora/masterlist/areas.api";
import { z } from "zod";

export interface StoreFormHandle {
  submitForm: () => Promise<void>;
  resetForm: () => void;
  isLoading: boolean;
}

interface StoreFormProps {
  isEditMode: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const Loader = () => (
  <AuroraSpinner
    size={14}
    primaryColor="var(--mui-palette-text-secondary)"
    secondaryColor="var(--mui-palette-text-secondary)"
  />
);
type StoreSchema = z.infer<typeof storeSchema>;
const defaultValues: StoreSchema = {
  name: "",
  region: {
    id: 0,
    name: "",
    region_head_id: 0,
    region_head: {
      id: 0,
      full_name: "",
    },
  },
  area: {
    name: "",
    id: 0,
    region: {
      name: "",
      id: 0,
    },
    area_head: {
      id: 0,
      full_name: "",
    },
  },
};

const StoreForm = forwardRef<StoreFormHandle, StoreFormProps>(
  ({ isEditMode, onSuccess, onCancel }, ref) => {
    const { enqueueSnackbar } = useSnackbar();

    const { currentParams } = useRememberQueryParams();

    const { close: closeUpdate } = useOpenCreate();

    const { data: storeData, isLoading: isLoadingStore } = useGetStoreQuery(
      currentParams.id,
      {
        skip: !isEditMode || !currentParams.id,
      }
    );

    const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
    const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();
    const isLoading = isCreating || isUpdating;

    const setFormValues = useCallback(() => {
      if (isEditMode && storeData?.data) {
        const store = storeData.data;
        setValue("name", store.name);
        setValue("region", {
          id: store.region.id,
          name: store.region.name,
          region_head: {
            id: store.region.region_head.id,
            full_name: store.region.region_head.full_name,
          },
          region_head_id: store.region.region_head_id,
        });
        setValue("area", {
          id: store.area.id,
          name: store.area.name,
          region: {
            id: store.region.id,
            name: store.region.name,
          },
          area_head: {
            id: store.area.area_head.id,
            full_name: store.area.area_head.full_name,
          },
        });
      } else {
        reset();
      }
    }, [isEditMode, storeData?.data]);

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
      resolver: zodResolver(storeSchema, { async: false }),
      defaultValues,
      criteriaMode: "all",
      mode: "onChange",
    });

    const createStoreHandler = useCallback(
      async (data: StorePayloadSchema) => {
        const response = await createStore({
          name: data.name,
          area_id: data.area_id.toString(),
          region_id: data.region_id.toString(),
        }).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Store Created successfully!",
        });
        onSuccess?.();
      },
      [createStore, enqueueSnackbar, onSuccess]
    );

    const updateStoreHandler = useCallback(
      async (data: StorePayloadSchema) => {
        if (!currentParams.id)
          throw new Error("No store ID provided for update");
        const response = await updateStore({
          id: currentParams.id,
          body: {
            name: data.name,
            region_id: data.region_id,
            area_id: data.area_id,
          },
        }).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Store updated successfully!",
        });
        onSuccess?.();
      },
      [updateStore, currentParams.id, enqueueSnackbar, onSuccess]
    );

    const handleStoreSubmit = useCallback(
      async (data: StoreSchema) => {
        if (isEditMode && !isDirty) {
          enqueueSnackbar({
            variant: "warning",
            message: "No changes.",
          });
          return; // Exit early without making API call
        }
        const storePayload: StorePayloadSchema = {
          name: data.name,
          region_id: Number(data.region.id),
          area_id: Number(data.area.id),
        };
        try {
          if (isEditMode) {
            await updateStoreHandler(storePayload);
          } else {
            await createStoreHandler(storePayload);
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
        updateStoreHandler,
        createStoreHandler,
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
        const onSubmitWrapper = async (data: StoreSchema) => {
          try {
            await handleStoreSubmit(data);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        handleSubmit(onSubmitWrapper)();
      });
    }, [handleSubmit, handleStoreSubmit, isEditMode, isDirty, enqueueSnackbar]);

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

    const [
      getRegions,
      { isLoading: isLoadingRegions, isFetching: isFetchingRegions },
    ] = useLazyGetUnpaginatedRegionsQuery();
    const [
      getAreas,
      { isLoading: isLoadingAreas, isFetching: isFetchingAreas },
    ] = useLazyGetUnpaginatedAreasQuery();

    const [openRegion, setOpenRegion] = useState(false);
    const [regionState, setRegionState] = useState<IRegionResponse[] | null>(
      null
    );

    const [openArea, setOpenArea] = useState(false);
    const [areaState, setAreaState] = useState<IAreaResponse[] | null>(null);

    const handleOpenRegion = async () => {
      try {
        const response = await getRegions({}).unwrap();
        setOpenRegion(!openRegion);
        const regions = response.data;
        setRegionState(regions);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.status === 422 || apiError.status === 404) {
          enqueueSnackbar(apiError.detail, { variant: "error" });
        } else {
          enqueueSnackbar("An unexpected error has occured", {
            variant: "error",
          });
        }
      }
    };

    const handleOpenArea = async () => {
      try {
        const response = await getAreas({}).unwrap();
        setOpenArea(!openArea);
        const areas = response.data;
        setAreaState(areas);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.status === 422 || apiError.status === 404) {
          enqueueSnackbar(apiError.detail, { variant: "error" });
        } else {
          enqueueSnackbar("An unexpected error has occured", {
            variant: "error",
          });
        }
      }
    };

    const handleCloseRegion = () => {
      setOpenRegion(!openRegion);
    };

    const handleCloseArea = () => {
      setOpenArea(!openArea);
    };

    if (isEditMode && isLoadingStore) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <Box display={"flex"}>
            <AuroraSpinner />
          </Box>
        </Box>
      );
    }

    const onSubmit = async (data: StoreSchema) => {
      if (isEditMode && !isDirty) {
        enqueueSnackbar({
          variant: "warning",
          message: "No changes.",
        });
        return; // Exit early without making API call
      }

      try {
        await handleStoreSubmit(data);
      } catch (error) {}
    };

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
                render={({ field: { onChange, ...rest } }) => {
                  return (
                    <Input
                      required
                      fullWidth
                      label="Name"
                      onChange={onChange}
                      error={!!errors.name}
                      helperText={errors?.name?.message}
                      {...rest}
                    />
                  );
                }}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="region"
                control={control}
                render={({ field: { value, onChange, ...rest } }) => {
                  return (
                    <Autocomplete
                      {...rest}
                      value={value || null}
                      options={regionState || []}
                      onOpen={handleOpenRegion}
                      onClose={handleCloseRegion}
                      open={openRegion}
                      loading={isLoadingRegions}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        Number(option.id) === Number(value.id)
                      }
                      onChange={(e, newValue) => {
                        onChange(newValue);
                      }}
                      renderInput={(params) => (
                        <Input
                          {...params}
                          value={value?.name || ""}
                          label="Regions"
                          size="small"
                          required
                          endIcon={
                            isLoadingRegions || isFetchingRegions ? (
                              <Loader />
                            ) : (
                              <></>
                            )
                          }
                          error={!!errors.region?.name}
                          helperText={errors?.region?.name?.message}
                          slotProps={{
                            input: {
                              value: value?.name,
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isLoadingRegions && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mr: 1,
                                      }}
                                    >
                                      <CircularProgress size={20} />
                                    </Box>
                                  )}
                                  {params.InputProps?.endAdornment}
                                </>
                              ),
                            },
                          }}
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="area"
                control={control}
                render={({ field: { value, onChange, ...rest } }) => {
                  return (
                    <Autocomplete
                      {...rest}
                      value={value || []}
                      onChange={(_, newValue) => {
                        onChange(newValue);
                      }}
                      options={areaState || []}
                      onOpen={handleOpenArea}
                      onClose={handleCloseArea}
                      open={openArea}
                      loading={isLoadingAreas}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        Number(option.id) === Number(value.id)
                      }
                      renderInput={(params) => (
                        <Input
                          {...params}
                          error={!!errors.area?.name}
                          helperText={errors?.area?.name?.message}
                          value={value?.name || ""}
                          label="Areas"
                          size="small"
                          required
                          endIcon={
                            isLoadingAreas || isFetchingAreas ? (
                              <Loader />
                            ) : (
                              <></>
                            )
                          }
                          slotProps={{
                            input: {
                              value: value?.name,
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isLoadingAreas && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mr: 1,
                                      }}
                                    >
                                      <CircularProgress size={20} />
                                    </Box>
                                  )}
                                  {params.InputProps?.endAdornment}
                                </>
                              ),
                            },
                          }}
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>
            <Grid size={12} sx={{ mt: 2 }}>
              {!ref && (
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={onCancel ? onCancel : () => reset()}
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
                      "Update Store"
                    ) : (
                      "Create Store"
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

export default StoreForm;
