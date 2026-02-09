import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useCallback, useEffect, useImperativeHandle } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import {
  useCreateGradingMutation,
  useGetGradingQuery,
  useUpdateGradingMutation,
} from "../../../features/api/aurora/masterlist/grading.api";
import { z } from "zod";

export interface GradingFormHandle {
  submitForm: () => Promise<void>;
  resetForm: () => void;
  isLoading: boolean;
}

interface GradingFormProps {
  isEditMode: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const gradingSchema = z.object({
  cap_percentage: z.number().min(0).max(100),
});

type GradingSchema = z.infer<typeof gradingSchema>;
type GradingPayloadSchema = GradingSchema;

const GradingForm = forwardRef<GradingFormHandle, GradingFormProps>(
  ({ isEditMode, onSuccess, onCancel }, ref) => {
    const { enqueueSnackbar } = useSnackbar();
    const { currentParams } = useRememberQueryParams();
    const { close: closeUpdate } = useOpenCreate();

    const { data: gradingData, isLoading: isLoadingGrading } =
      useGetGradingQuery(currentParams.id, {
        skip: !isEditMode || !currentParams.id,
      });

    const [createGrading, { isLoading: isCreating }] =
      useCreateGradingMutation();
    const [updateGrading, { isLoading: isUpdating }] =
      useUpdateGradingMutation();

    const isLoading = isCreating || isUpdating || isLoadingGrading;

    const {
      control,
      handleSubmit,
      reset,
      setValue,
      formState: { errors, isDirty },
    } = useForm({
      defaultValues: {
        cap_percentage: -1,
      },
      resolver: zodResolver(gradingSchema, { async: false }),
      criteriaMode: "all",
      mode: "onChange",
    });

    const setFormValues = useCallback(() => {
      if (isEditMode && gradingData?.data) {
        const grading = Array.isArray(gradingData.data)
          ? gradingData.data[0]
          : gradingData.data;

        if (grading) {
          setValue("cap_percentage", Number(grading.cap_percentage));
        }
      } else {
        reset();
      }
    }, [isEditMode, gradingData, setValue, reset]);

    useEffect(() => {
      setFormValues();
    }, [setFormValues]);

    const createGradingHandler = useCallback(
      async (data: GradingPayloadSchema) => {
        const response = await createGrading(data).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Grading created successfully!",
        });
        onSuccess?.();
      },
      [createGrading, enqueueSnackbar, onSuccess],
    );

    const updateGradingHandler = useCallback(
      async (data: GradingPayloadSchema) => {
        if (!currentParams.id)
          throw new Error("No grading ID provided for update");

        const response = await updateGrading({
          id: currentParams.id,
          body: {
            cap_percentage: data.cap_percentage,
          },
        }).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Grading updated successfully!",
        });
        onSuccess?.();
      },
      [updateGrading, currentParams.id, enqueueSnackbar, onSuccess],
    );

    const handleGradingSubmit = useCallback(
      async (data: GradingPayloadSchema) => {
        if (isEditMode && !isDirty) {
          enqueueSnackbar({
            variant: "warning",
            message: "No changes.",
          });
          return;
        }

        try {
          if (isEditMode) {
            await updateGradingHandler(data);
          } else {
            await createGradingHandler(data);
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
        updateGradingHandler,
        createGradingHandler,
        enqueueSnackbar,
        closeUpdate,
      ],
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
        const onSubmitWrapper = async (data: GradingSchema) => {
          const payload: GradingPayloadSchema = {
            cap_percentage: data.cap_percentage,
          };

          try {
            await handleGradingSubmit(payload);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        handleSubmit(onSubmitWrapper)();
      });
    }, [
      handleSubmit,
      handleGradingSubmit,
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

    const onSubmit = async (data: GradingSchema) => {
      const payload: GradingPayloadSchema = {
        cap_percentage: data.cap_percentage,
      };
      if (isEditMode && !isDirty) {
        enqueueSnackbar({
          variant: "warning",
          message: "No changes.",
        });
        return;
      }

      try {
        await handleGradingSubmit(payload);
      } catch (error) {}
    };

    if (isEditMode && isLoadingGrading) {
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
          sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Controller
                name="cap_percentage"
                control={control}
                render={({ field: { onChange, value, ...rest } }) => {
                  return (
                    <Input
                      value={value === -1 ? "" : value}
                      onChange={(e) => {
                        const numValue =
                          e.target.value === "" ? "" : Number(e.target.value);
                        onChange(numValue);
                      }}
                      slotProps={{
                        input: { type: "number" },
                        htmlInput: {
                          type: "number",
                          min: 0,
                          max: 100,
                          step: 0.01,
                        },
                      }}
                      required
                      {...rest}
                      fullWidth
                      label="Cap Percentage"
                      error={!!errors.cap_percentage}
                      helperText={errors.cap_percentage?.message}
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

export default GradingForm;
