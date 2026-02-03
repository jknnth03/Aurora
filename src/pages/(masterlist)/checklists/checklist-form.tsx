import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { v4 as uuidv4 } from "uuid";

import Box from "@mui/material/Box";
import { useSnackbar } from "notistack";
import AuroraSpinner from "../../../components/ui/aurora-spinner/aurora-spinner";
import {
  ApiError,
  ApiErrorResponse,
  isApiErrorResponse,
} from "../../../features/api/aurora/types/types";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import {
  checklistPayloadSchema,
  ChecklistPayloadSchema,
  ChecklistSchema,
} from "./checklist.schema";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import {
  useCreateChecklistMutation,
  useGetChecklistQuery,
  useUpdateChecklistMutation,
} from "../../../features/api/aurora/masterlist/checklist.api";
import Grid from "@mui/material/Grid";
import Input from "../../../components/ui/input/input";
import Button from "@mui/material/Button";
import { PlusSquare, X } from "@phosphor-icons/react";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Option from "./components/option";
import Typography from "@mui/material/Typography";

export interface ChecklistFormHandle {
  submitForm: () => Promise<void>;
  resetForm: () => void;
  isLoading: boolean;
}

interface ChecklistFormProps {
  isEditMode: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ChecklistForm = forwardRef<ChecklistFormHandle, ChecklistFormProps>(
  ({ isEditMode, onSuccess }, ref) => {
    const { enqueueSnackbar } = useSnackbar();

    const { currentParams } = useRememberQueryParams();

    const { close: closeUpdate } = useOpenCreate();

    const [createChecklist, { isLoading: isCreating }] =
      useCreateChecklistMutation();
    const [updateChecklist, { isLoading: isUpdating }] =
      useUpdateChecklistMutation();

    const isLoading = isCreating || isUpdating;

    const { data: checklistData, isLoading: isLoadingChecklist } =
      useGetChecklistQuery(currentParams.id, {
        skip: !isEditMode || !currentParams.id,
      });
    const {
      control,
      handleSubmit,
      reset,
      watch,
      formState: { errors, isDirty },
    } = useForm<ChecklistSchema>({
      defaultValues: {
        name: "",
        sections: [],
      },
      resolver: zodResolver(checklistPayloadSchema, { async: false }),
      criteriaMode: "all",
      mode: "onChange",
    });
    const {
      fields: sectionFields,
      append,
      update,
      replace,
    } = useFieldArray({
      control,
      name: "sections",
    });

    useEffect(() => {
      if (isEditMode && checklistData?.data) {
        const { name, sections } = checklistData.data;
        const transformedResponse: ChecklistPayloadSchema["sections"] =
          sections.map((section) => ({
            title: section.title,
            order_index: section.order_index - 1,
            category: section.category?.name || "",
            category_id: section.category_id || null,
            questions: section.questions.map((question) => {
              return {
                question_text: question.question_text,
                question_type: question.question_type,
                order_index: question.order_index - 1,
                options: question.options.map((option) => {
                  return {
                    option_text: option.option_text,
                    order_index: option.order_index - 1,
                  };
                }),
              };
            }),
          }));
        reset({ name: name, sections: transformedResponse });
      }
    }, [isEditMode, checklistData?.data]);

    const createChecklistHandler = useCallback(
      async (data: ChecklistPayloadSchema) => {
        const response = await createChecklist(data).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Checklist Created successfully!",
        });
        onSuccess?.();
      },
      [createChecklist, enqueueSnackbar, onSuccess],
    );

    const updateChecklistHandler = useCallback(
      async (data: ChecklistPayloadSchema) => {
        if (!currentParams.id)
          throw new Error("No checklist ID provided for update");
        const response = await updateChecklist({
          id: currentParams.id,
          body: data,
        }).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Checklist updated successfully!",
        });
        onSuccess?.();
      },
      [updateChecklist, currentParams.id, enqueueSnackbar, onSuccess],
    );

    const transformDataForSubmission = (
      data: ChecklistPayloadSchema,
    ): ChecklistPayloadSchema => {
      return {
        name: data.name,
        sections: data.sections.map((section) => {
          const {
            title,
            order_index: index,
            questions,
            category,
            category_id,
          } = section;
          const order_index = index;
          return {
            title,
            order_index,
            category,
            category_id,
            questions: questions.map((question) => {
              const {
                question_text,
                question_type,
                order_index: question_index,
                options,
              } = question;
              return {
                question_text,
                question_type,
                order_index: question_index + 1,
                options: options.map((option) => {
                  const { option_text, order_index: option_index } = option;
                  return { option_text, order_index: option_index + 1 };
                }),
              };
            }),
          };
        }),
      };
    };

    const handleChecklistSubmit = useCallback(
      async (data: ChecklistPayloadSchema) => {
        if (isEditMode && !isDirty) {
          enqueueSnackbar({
            variant: "warning",
            message: "No changes.",
          });
          return;
        }

        try {
          const transformedData = transformDataForSubmission(data);
          if (isEditMode) {
            await updateChecklistHandler(transformedData);
          } else {
            await createChecklistHandler(transformedData);
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
        updateChecklistHandler,
        createChecklistHandler,
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
        const onSubmitWrapper = async (data: ChecklistPayloadSchema) => {
          try {
            await handleChecklistSubmit(data);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        handleSubmit(onSubmitWrapper)();
      });
    }, [
      handleSubmit,
      handleChecklistSubmit,
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

    const renderOption = (
      questionType: "multiple_choice" | "checkboxes" | "paragraph",
      sectionIndex: number,
      questionIndex: number,
      optionIndex: number,
    ) => {
      const removeOption = () => {
        const filteredOptions = watch("sections")?.map((item, index) => {
          if (sectionIndex === index) {
            const questions = item.questions.map((question, index) => {
              if (index === questionIndex) {
                return {
                  ...question,
                  options: question.options
                    ?.filter((_, i) => i !== optionIndex)
                    .map((option, index) => ({
                      ...option,
                      order_index: index,
                    })),
                };
              }
              return question;
            });
            return {
              ...item,
              questions,
            };
          } else {
            return item;
          }
        });
        replace(filteredOptions);
      };
      return (
        <Grid
          size={12}
          key={`option-${sectionIndex}-${questionIndex}-${optionIndex}`}>
          <Option
            questionType={questionType}
            sectionIndex={sectionIndex}
            questionIndex={questionIndex}
            removeOption={removeOption}
            optionIndex={optionIndex}
            control={control}
            errors={errors}
          />
        </Grid>
      );
    };

    const renderQuestion = (
      sectionIndex: number,
      questionIndex: number,
      questionArrayIndex: number,
    ) => {
      return (
        <Grid container sx={{ padding: "1rem" }} spacing={2} size={12}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}>
            <X
              size={17}
              onClick={() => {
                const filteredQuestions = watch("sections")?.map(
                  (item, index) => {
                    if (sectionIndex === index) {
                      const questions = item.questions
                        ?.filter((question, idx) => idx !== questionArrayIndex)
                        .map((question, index) => ({
                          ...question,
                          order_index: index,
                        }));
                      return {
                        ...item,
                        questions,
                      };
                    } else {
                      return item;
                    }
                  },
                );

                replace(filteredQuestions);
              }}
            />
          </Box>
          <Grid size={12}>
            <Controller
              control={control}
              name={`sections.${sectionIndex}.questions.${questionArrayIndex}.question_text`}
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label="Question"
                    fullWidth
                    variant="outlined"
                    required
                    error={
                      !!errors.sections?.[sectionIndex]?.questions?.[
                        questionArrayIndex
                      ]?.question_text
                    }
                    helperText={
                      errors.sections?.[sectionIndex]?.questions?.[
                        questionArrayIndex
                      ]?.question_text?.message
                    }
                  />
                );
              }}
            />
          </Grid>
          <Grid container size={12}>
            <Grid size={12}>
              <Controller
                control={control}
                name={`sections.${sectionIndex}.questions.${questionArrayIndex}.question_type`}
                render={({ field }) => {
                  return (
                    <>
                      <Select
                        {...field}
                        error={
                          !!errors.sections?.[sectionIndex]?.questions?.[
                            questionArrayIndex
                          ]?.question_type
                        }
                        fullWidth>
                        <MenuItem selected value="multiple_choice">
                          Multiple Choice
                        </MenuItem>
                        <MenuItem value="checkboxes">Checkboxes</MenuItem>
                        <MenuItem value="paragraph">Paragraph</MenuItem>
                      </Select>
                      {errors.sections?.[sectionIndex]?.questions?.[
                        questionArrayIndex
                      ]?.question_type?.message && (
                        <Typography color="error">
                          {
                            errors.sections?.[sectionIndex]?.questions?.[
                              questionArrayIndex
                            ]?.question_type?.message
                          }
                        </Typography>
                      )}
                    </>
                  );
                }}
              />
            </Grid>
            <Grid spacing={2} container size={12}>
              {sectionFields[sectionIndex].questions[
                questionArrayIndex
              ].options.map((option, optionArrayIndex) => {
                const questionType = watch(
                  `sections.${sectionIndex}.questions.${questionArrayIndex}.question_type`,
                );
                return renderOption(
                  questionType,
                  sectionIndex,
                  questionIndex,
                  optionArrayIndex,
                );
              })}
            </Grid>

            <Grid size={12}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ border: "2px solid orange" }}
                startIcon={<PlusSquare size={20} color="orange" />}
                disabled={
                  watch(
                    `sections.${sectionIndex}.questions.${questionArrayIndex}.question_type`,
                  ) === "paragraph"
                    ? true
                    : false
                }
                onClick={() => {
                  const currentSection = sectionFields[sectionIndex];
                  const currentQuestion =
                    currentSection.questions[questionArrayIndex];

                  const updatedOptions = [
                    ...(currentQuestion.options || []),
                    {
                      option_text: "",
                      order_index: currentQuestion.options.length,
                      id: uuidv4(),
                    },
                  ];

                  const updatedQuestions = currentSection.questions.map(
                    (q, idx) =>
                      idx === questionArrayIndex
                        ? { ...q, options: updatedOptions }
                        : q,
                  );
                  update(sectionIndex, {
                    ...currentSection,
                    questions: updatedQuestions,
                  });
                }}>
                Add an Option
              </Button>
              {!!errors?.sections?.[sectionIndex]?.questions?.[questionIndex]
                ?.options && (
                <Typography color="error" sx={{ marginY: "0.8rem" }}>
                  {errors?.sections?.[sectionIndex]?.questions?.[questionIndex]
                    ?.options.root?.message ||
                    errors?.sections?.[sectionIndex]?.questions?.[questionIndex]
                      ?.options?.message}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
      );
    };

    const renderSection = (section: number | string, sectionIndex: number) => {
      return (
        <Grid size={12}>
          <Paper sx={{ padding: "1rem" }} elevation={4}>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 2,
              }}>
              <X
                size={17}
                onClick={() => {
                  const clonedSections = [...watch("sections")];
                  const filteredSections = clonedSections
                    .filter((_, idx) => idx !== sectionIndex)
                    .map((item, index) => ({
                      ...item,
                      order_index: index,
                    }));
                  replace(filteredSections);
                }}
              />
            </Box>
            <Grid container spacing={2} size={12}>
              <Grid size={12}>
                <Controller
                  control={control}
                  name={`sections.${sectionIndex}.title`}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Section title"
                      fullWidth
                      variant="outlined"
                      slotProps={{ inputLabel: { shrink: true } }}
                      required
                      error={!!errors?.sections?.[sectionIndex]?.title}
                      helperText={
                        errors?.sections?.[sectionIndex]?.title?.message
                      }
                    />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  control={control}
                  name={`sections.${sectionIndex}.category`}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Category"
                      fullWidth
                      variant="outlined"
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={!!errors?.sections?.[sectionIndex]?.category}
                      helperText={
                        errors?.sections?.[sectionIndex]?.category?.message
                      }
                    />
                  )}
                />
              </Grid>
              {sectionFields[sectionIndex]?.questions?.map(
                (question, questionIndex) => (
                  <Paper
                    key={`question-${sectionIndex}-${questionIndex}`}
                    elevation={2}
                    style={{ width: "100%" }}>
                    {renderQuestion(
                      sectionIndex,
                      question.order_index,
                      questionIndex,
                    )}
                  </Paper>
                ),
              )}

              <Grid size={12}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlusSquare size={20} color="orange" />}
                  onClick={() => {
                    const currentSection = watch("sections")[sectionIndex];
                    const updatedQuestions = [
                      ...(currentSection.questions || []),
                      {
                        id: uuidv4(),
                        question_text: "",
                        question_type: "multiple_choice" as const,
                        order_index: currentSection?.questions?.length,
                        options: [],
                      },
                    ];

                    update(sectionIndex, {
                      ...currentSection,
                      questions: updatedQuestions,
                    });
                  }}>
                  Add a Question
                </Button>
                {!!errors?.sections?.[sectionIndex]?.questions && (
                  <Typography color="error" sx={{ marginY: "0.8rem" }}>
                    {errors?.sections?.[sectionIndex]?.questions.message}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      );
    };

    if (isEditMode && isLoadingChecklist) {
      return <AuroraSpinner />;
    }

    return (
      <>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2} size={12}>
            <Grid size={12}>
              <Controller
                control={control}
                name="name"
                render={({ field }) => {
                  return (
                    <Input
                      {...field}
                      slotProps={{
                        inputLabel: { shrink: field.value ? true : false },
                      }}
                      label="Name"
                      fullWidth
                      variant="outlined"
                      required
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  );
                }}
              />
            </Grid>
            {sectionFields.map((section, sectionIndex) => (
              <React.Fragment key={`section-${sectionIndex}`}>
                {renderSection(section.id, sectionIndex)}
              </React.Fragment>
            ))}
            <Grid size={12}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<PlusSquare size={20} color="orange" />}
                onClick={() => {
                  const order_index_section = sectionFields.length;
                  append({
                    id: uuidv4(),
                    title: "",
                    category: "",
                    category_id: null,
                    order_index: order_index_section,
                    questions: [],
                  });
                }}>
                Add a section
              </Button>
              {!!errors.sections && (
                <Typography color="error" sx={{ marginY: "0.8rem" }}>
                  {errors.sections.message}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </>
    );
  },
);

export default ChecklistForm;
