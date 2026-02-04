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
import { ApiError } from "../../../features/api/aurora/types/types";
import ApiErrorResponse from "../../../features/api/aurora/types/types";
import { isApiErrorResponse } from "../../../features/api/aurora/types/types";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import {
  StoreChecklistPayload,
  storeChecklistSchema,
  StoreChecklistSchema,
} from "./store-checklist.schema";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import {
  IChecklistResponse,
  useLazyGetChecklistQuery,
  useLazyGetChecklistsQuery,
} from "../../../features/api/aurora/masterlist/checklist.api";
import {
  IStoreResponse,
  useLazyGetStoreQuery,
  useLazyGetStoresQuery,
} from "../../../features/api/aurora/masterlist/store.api";
import {
  useCreateStoreChecklistMutation,
  useLazyGetStoreChecklistQuery,
  useUpdateStoreChecklistMutation,
} from "../../../features/api/aurora/masterlist/store-checklist.api";
import { TextField } from "@mui/material";

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

const defaultValues = {
  store_id: 0,
  store: {
    id: 0,
    code: "",
    name: "",
    region: {
      id: 0,
      name: "",
      region_head_id: 0,
      region_head: {
        id: 0,
        full_name: "",
        user_status: "",
      },
      created_at: "",
      updated_at: "",
      deleted_at: "",
      areas: "",
    },
    area: {
      id: 0,
      name: "",
      region: {
        id: 0,
        name: "",
      },
      area_head: {
        id: 0,
        full_name: "",
        user_status: "",
      },
    },
    created_at: "",
    updated_at: "",
    deleted_at: "",
  },
  checklist_id: 0,
  checklist: {
    id: 0,
    name: "",
    created_at: "",
    updated_at: "",
    deleted_at: "",
    sections: [
      {
        id: 0,
        checklist_id: 0,
        title: "",
        order_index: 0,
        created_at: "",
        updated_at: "",
        deleted_at: "",
        questions: [
          {
            id: 0,
            section_id: 0,
            question_text: "",
            question_type: "multiple_choice" as const,
            order_index: 0,
            created_at: "",
            updated_at: "",
            deleted_at: "",
            options: [
              {
                id: 0,
                question_id: 0,
                option_text: "",
                order_index: 0,
                created_at: "",
                updated_at: "",
                deleted_at: "",
              },
            ],
          },
        ],
      },
    ],
  },
};

const StoreChecklistForm = forwardRef<StoreFormHandle, StoreFormProps>(
  ({ isEditMode, onSuccess, onCancel }, ref) => {
    const { enqueueSnackbar } = useSnackbar();

    const { currentParams } = useRememberQueryParams();
    const storeChecklistId = currentParams?.id;
    const { close: closeUpdate } = useOpenCreate();

    const [
      getStoreChecklist,
      {
        isLoading: isLoadingStoreChecklist,
        isFetching: isFetchingStoreChecklist,
      },
    ] = useLazyGetStoreChecklistQuery();

    const [
      getStores,
      { isLoading: isLoadingStores, isFetching: isFetchingStores },
    ] = useLazyGetStoresQuery();

    const [
      getChecklists,
      { isLoading: isLoadingChecklists, isFetching: isFetchingChecklists },
    ] = useLazyGetChecklistsQuery();

    const [
      getStore,
      { isLoading: isLoadingStore, isFetching: isFetchingStore },
    ] = useLazyGetStoreQuery();

    const [
      getChecklist,
      { isLoading: isLoadingChecklist, isFetching: isFetchingChecklist },
    ] = useLazyGetChecklistQuery();

    const [createStoreChecklist, { isLoading: isCreating }] =
      useCreateStoreChecklistMutation();
    const [updateStoreChecklist, { isLoading: isUpdating }] =
      useUpdateStoreChecklistMutation();
    const isLoading = isCreating || isUpdating;

    const setFormValues = useCallback(async () => {
      if (isEditMode) {
        const response = await getStoreChecklist(storeChecklistId).unwrap();
        const storeChecklist = response.data;
        const storeResponse = await getStore(storeChecklist.store.id).unwrap();
        const checklistResponse = await getChecklist(
          storeChecklist.checklist.id,
        ).unwrap();
        reset({
          store: storeResponse.data,
          checklist: checklistResponse.data,
          checklist_id: checklistResponse.data.id,
          store_id: storeResponse.data.id,
        });
      } else {
        reset();
      }
    }, [
      isEditMode,
      getStoreChecklist,
      storeChecklistId,
      getChecklist,
      getStore,
    ]);

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
      resolver: zodResolver(storeChecklistSchema, { async: false }),
      defaultValues,
      criteriaMode: "all",
      mode: "onChange",
    });
    // console.log(watch());
    // console.log(errors);
    const createStoreChecklistHandler = useCallback(
      async (data: StoreChecklistPayload) => {
        const response = await createStoreChecklist({
          store_id: data.store_id,
          store_name: data.store_name,
          checklist_id: data.checklist_id,
          checklist_name: data.checklist_name,
        }).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Store Created successfully!",
        });
        onSuccess?.();
      },
      [createStoreChecklist, enqueueSnackbar, onSuccess],
    );

    const updateStoreChecklistHandler = useCallback(
      async (data: StoreChecklistPayload) => {
        if (!currentParams.id)
          throw new Error("No store ID provided for update");
        const response = await updateStoreChecklist({
          id: currentParams.id,
          body: {
            store_id: data.store_id,
            store_name: data.store_name,
            checklist_id: data.checklist_id,
            checklist_name: data.checklist_name,
          },
        }).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Store updated successfully!",
        });
        onSuccess?.();
      },
      [updateStoreChecklist, currentParams.id, enqueueSnackbar, onSuccess],
    );

    const handleStoreChecklistSubmit = useCallback(
      async (data: StoreChecklistPayload) => {
        if (isEditMode && !isDirty) {
          enqueueSnackbar({
            variant: "warning",
            message: "No changes.",
          });
          return; // Exit early without making API call
        }
        const storeChecklistPayload: StoreChecklistPayload = {
          store_id: data.store_id,
          store_name: data.store_name,
          checklist_id: data.checklist_id,
          checklist_name: data.checklist_name,
        };
        try {
          if (isEditMode) {
            await updateStoreChecklistHandler(storeChecklistPayload);
          } else {
            await createStoreChecklistHandler(storeChecklistPayload);
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
        updateStoreChecklistHandler,
        createStoreChecklistHandler,
        enqueueSnackbar,
      ],
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
        const onSubmitWrapper = async (data: StoreChecklistSchema) => {
          const payload: StoreChecklistPayload = {
            store_id: data.store_id,
            store_name: data.store.name || "",
            checklist_id: data.checklist_id,
            checklist_name: data.checklist.name,
          };
          try {
            await handleStoreChecklistSubmit(payload);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        handleSubmit(onSubmitWrapper)();
      });
    }, [
      handleSubmit,
      handleStoreChecklistSubmit,
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
      [submitForm, resetForm, isLoading],
    );

    const [openStore, setOpenStore] = useState(false);
    const [storeState, setStoreState] = useState<IStoreResponse[] | null>(null);

    const [openChecklist, setOpenChecklist] = useState(false);
    const [checklistState, setChecklistState] = useState<
      IChecklistResponse[] | null
    >(null);

    const handleOpenStore = async () => {
      try {
        const response = await getStores({ status: "active" }).unwrap();
        setOpenStore(!openStore);
        const stores = response.data.data;
        setStoreState(stores);
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

    const handleOpenChecklist = async () => {
      try {
        const response = await getChecklists({ status: "active" }).unwrap();
        setOpenChecklist(!openChecklist);
        const checklists = response.data.data;
        setChecklistState(checklists);
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

    const handleCloseStore = () => {
      setOpenStore(!openStore);
    };

    const handleCloseChecklist = () => {
      setOpenChecklist(!openChecklist);
    };

    if (
      (isEditMode && isLoadingStoreChecklist) ||
      isFetchingStoreChecklist ||
      isLoadingChecklist ||
      isLoadingStore ||
      isFetchingStore ||
      isFetchingChecklist
    ) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <Box display={"flex"}>
            <AuroraSpinner />
          </Box>
        </Box>
      );
    }

    const onSubmit = async (data: StoreChecklistSchema) => {
      if (isEditMode && !isDirty) {
        enqueueSnackbar({
          variant: "warning",
          message: "No changes.",
        });
        return; // Exit early without making API call
      }
      const payload = {
        store_id: data.store_id,
        store_name: data.store.name,
        checklist_id: data.checklist_id,
        checklist_name: data.checklist.name,
      };
      try {
        await handleStoreChecklistSubmit({
          store_id: payload.store_id,
          store_name: payload.store_name ?? "",
          checklist_id: payload.checklist_id,
          checklist_name: payload.checklist_name,
        });
      } catch (error) {}
    };

    // console.log(watch());
    // console.log(errors);
    return (
      <>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Controller
                control={control}
                name="store"
                render={({ field: { name, onChange, ...rest } }) => {
                  return (
                    <Autocomplete
                      {...rest}
                      open={openStore}
                      onChange={(_, newValue) => {
                        onChange(() =>
                          onChange(newValue ?? defaultValues.store),
                        );
                        setValue(
                          "store_id",
                          newValue?.id ?? defaultValues.store_id,
                        );
                      }}
                      value={watch(name)}
                      options={storeState || []}
                      getOptionLabel={(option) => option.name || ""}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      onOpen={handleOpenStore}
                      onClose={handleCloseStore}
                      renderInput={(params) => {
                        return (
                          <Input
                            {...params}
                            required
                            label="Store Name"
                            fullWidth
                            error={!!errors.store}
                            helperText={errors.store?.message}
                            slotProps={{
                              input: {
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {isLoadingStore || isFetchingStore ? (
                                      <Box
                                        component="span"
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          mr: 1,
                                        }}>
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
                control={control}
                name="checklist"
                render={({ field: { name, onChange, ...rest } }) => {
                  return (
                    <Autocomplete
                      {...rest}
                      open={openChecklist}
                      onChange={(_, newValue) => {
                        onChange(() =>
                          onChange(newValue ?? defaultValues.checklist),
                        );
                        setValue(
                          "checklist_id",
                          newValue?.id ?? defaultValues.checklist_id,
                        );
                      }}
                      value={watch(name)}
                      options={checklistState || []}
                      getOptionLabel={(option) => option.name || ""}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      onOpen={handleOpenChecklist}
                      onClose={handleCloseChecklist}
                      renderInput={(params) => {
                        return (
                          <Input
                            {...params}
                            label="Checklist Name"
                            fullWidth
                            required
                            error={!!errors.checklist}
                            helperText={errors.checklist?.message}
                            slotProps={{
                              input: {
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {isLoadingChecklist ||
                                    isFetchingChecklist ? (
                                      <Box
                                        component="span"
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          mr: 1,
                                        }}>
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
  },
);

export default StoreChecklistForm;
