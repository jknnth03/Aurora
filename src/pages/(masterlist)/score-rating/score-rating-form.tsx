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
import { scoreRatingSchema } from "./score-rating.schema";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import {
  ScoreRatingPayloadSchema,
  ScoreRatingSchema,
  useCreateScoreRatingMutation,
  useGetScoreRatingQuery,
  useGetUnpaginatedScoreRatingsQuery,
  useUpdateScoreRatingMutation,
} from "../../../features/api/aurora/masterlist/score-rating.api";
import { setError } from "../../../features/slices/auth-slice";

export interface ScoreRatingFormHandle {
  submitForm: () => Promise<void>;
  resetForm: () => void;
  isLoading: boolean;
}

interface ScoreRatingFormProps {
  isEditMode: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ScoreRatingForm = forwardRef<ScoreRatingFormHandle, ScoreRatingFormProps>(
  ({ isEditMode, onSuccess, onCancel }, ref) => {
    const { enqueueSnackbar } = useSnackbar();

    const { currentParams } = useRememberQueryParams();

    const { close: closeUpdate } = useOpenCreate();

    const { data: scoreRatingData, isLoading: isLoadingScoreRating } =
      useGetScoreRatingQuery(currentParams.id, {
        skip: !isEditMode || !currentParams.id,
      });

    const {
      data: scoreRatings,
      isLoading: isLoadingScoresRating,
      isFetching: isFetchingScoreRating,
      isError: isErrorScoreRating,
    } = useGetUnpaginatedScoreRatingsQuery({ status: "active" });

    const scoreRatingsData = scoreRatings?.data.map((score) => ({
      rating: score.rating,
      score: score.score,
      len: scoreRatings.data.length,
    }));
    const [createScoreRating, { isLoading: isCreating }] =
      useCreateScoreRatingMutation();
    const [updateScoreRating, { isLoading: isUpdating }] =
      useUpdateScoreRatingMutation();

    const isLoading = isCreating || isUpdating || isLoadingScoreRating;

    const notSelfEdit = scoreRatings?.data.some(
      (item) => item.id === scoreRatingData?.data.id,
    );
    const hasRatingDupe = scoreRatings?.data.some(
      (item) => item.rating === scoreRatingData?.data?.rating && !notSelfEdit,
    );
    const hasScoreDupe = scoreRatings?.data.some(
      (item) => item.score === scoreRatingData?.data?.score && !notSelfEdit,
    );

    const setFormValues = useCallback(() => {
      if (isEditMode && scoreRatingData?.data) {
        const scoreRating = scoreRatingData.data;
        setValue("savedRating", scoreRating.rating);
        setValue("savedScore", scoreRating.score);
        setValue("rating", scoreRating.rating);
        setValue("score", scoreRating.score);
      } else {
        reset();
      }
    }, [isEditMode, scoreRatingData]);

    useEffect(() => {
      setFormValues();
    }, [setFormValues]);

    const {
      control,
      handleSubmit,
      reset,
      setValue,
      setError,
      watch,
      formState: { errors, isDirty },
    } = useForm({
      defaultValues: {
        rating: -1,
        score: -1,
      },
      resolver: zodResolver(scoreRatingSchema, { async: false }),
      criteriaMode: "all",
      mode: "onChange",
    });

    const createScoreRatingHandler = useCallback(
      async (data: ScoreRatingPayloadSchema) => {
        const response = await createScoreRating(data).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Score Rating Created successfully!",
        });
        onSuccess?.();
      },
      [createScoreRating, enqueueSnackbar, onSuccess],
    );

    const updateScoreRatingHandler = useCallback(
      async (data: ScoreRatingPayloadSchema) => {
        if (!currentParams.id)
          throw new Error("No score rating ID provided for update");

        const response = await updateScoreRating({
          id: currentParams.id,
          body: {
            rating: data.rating,
            score: data.score,
          },
        }).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Score Rating updated successfully!",
        });
        onSuccess?.();
      },
      [updateScoreRating, currentParams.id, enqueueSnackbar, onSuccess],
    );

    const handleScoreRatingSubmit = useCallback(
      async (data: ScoreRatingPayloadSchema) => {
        if (isEditMode && !isDirty) {
          enqueueSnackbar({
            variant: "warning",
            message: "No changes.",
          });
          return; // Exit early without making API call
        }

        try {
          if (isEditMode) {
            await updateScoreRatingHandler(data);
          } else {
            await createScoreRatingHandler(data);
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
        updateScoreRatingHandler,
        createScoreRatingHandler,
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
      if ((hasRatingDupe || hasScoreDupe) && isEditMode) {
        if (hasRatingDupe) {
          setError("rating", { message: "Rating must be unique" });
        }
        if (hasScoreDupe) {
          setError("score", { message: "Score must be unique" });
        }
        return;
      }

      return new Promise<void>((resolve, reject) => {
        const onSubmitWrapper = async (data: ScoreRatingSchema) => {
          const payload: ScoreRatingPayloadSchema = {
            rating: data.rating,
            score: data.score,
          };

          try {
            await handleScoreRatingSubmit(payload);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        handleSubmit(onSubmitWrapper)();
      });
    }, [
      handleSubmit,
      handleScoreRatingSubmit,
      isEditMode,
      isDirty,
      enqueueSnackbar,
    ]);
    const resetForm = useCallback(() => {
      reset();
    }, [reset]);
    console.log(watch());
    useImperativeHandle(
      ref,
      () => ({
        submitForm,
        resetForm,
        isLoading,
      }),
      [submitForm, resetForm, isLoading],
    );

    const onSubmit = async (data: ScoreRatingSchema) => {
      const payload: ScoreRatingPayloadSchema = {
        rating: data.rating,
        score: data.score,
      };
      if (isEditMode && !isDirty) {
        enqueueSnackbar({
          variant: "warning",
          message: "No changes.",
        });
        return; // Exit early without making API call
      }

      try {
        await handleScoreRatingSubmit(payload);
      } catch (error) {}
    };

    if (isEditMode && isLoadingScoreRating) {
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
                name="rating"
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
                        htmlInput: { type: "number", min: 0 },
                      }}
                      required
                      {...rest}
                      fullWidth
                      label="Rating"
                      error={!!errors.rating}
                      helperText={errors.rating?.message}
                    />
                  );
                }}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="score"
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
                        htmlInput: { type: "number", min: 0 },
                      }}
                      required
                      {...rest}
                      fullWidth
                      label="Score"
                      error={!!errors.score}
                      helperText={errors.score?.message}
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

export default ScoreRatingForm;
