import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Control, Controller, useForm } from "react-hook-form";

import Box from "@mui/material/Box";
import { useSnackbar } from "notistack";
import AuroraSpinner from "../../../components/ui/aurora-spinner/aurora-spinner";
import {
  ApiError,
  ApiErrorResponse,
  isApiErrorResponse,
} from "../../../features/api/aurora/types/types";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";

import { useGetChecklistQuery } from "../../../features/api/aurora/masterlist/checklist.api";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Paper from "@mui/material/Paper";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow, { tableRowClasses } from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import { styled } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
import {
  ChecklistUserSchema,
  checklistUserSchema,
} from "./checklist-user.schema";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import { FileImage, X } from "@phosphor-icons/react/dist/ssr";
import Autocomplete from "@mui/material/Autocomplete";
import FormLabel from "@mui/material/FormLabel";
import { useLazyGetUsersUnpaginatedQuery } from "../../../features/api/aurora/masterlist/user.api";
import { RootState } from "../../../app/store";
import { useSelector } from "react-redux";
import {
  IQAAnswers,
  IQAWeekAnswer,
  QADashboardPayloadSchema,
  useCreateQAMutation,
  useGetQAQuery,
  useResurveyMutation,
} from "../../../features/api/aurora/qa-dashboard.api";
import { CONFIG } from "../../../config/config";
import { useLocation } from "react-router";
import { useOpenChecklist } from "../../../hooks/useOpenChecklist";
import ViewImageDialog from "./components/view-image-dialog";
import moment from "moment";
import { useClock } from "../../../hooks/useClock";
import { Clock } from "@phosphor-icons/react";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import { useOpenUpdate } from "../../../hooks/useOpenUpdate";

export interface ChecklistUserFormHandle {
  submitForm: () => Promise<void>;
  resetForm: () => void;
  isLoadingQAItem: boolean;
}

interface ChecklistUserFormProps {
  isOpenUserForm: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  isSubmittingForm: boolean;
  isCreateChecklistQAOpen: {
    open: boolean;
    id: string | number;
  };
  setIsCreateChecklistQAOpen: React.Dispatch<
    React.SetStateAction<{ open: boolean; id: string }>
  >;
}

type DisplayChecklistUserRows = {
  questions: Array<{
    id: number;
    section_id: number;
    question_text: string;
    question_type: "multiple_choice" | "checkboxes" | "paragraph";
    order_index: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    options: Array<{
      id: number;
      question_id: number;
      option_text: string;
      order_index: number;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    }>;
  }>;
};

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "var(--primary-white)",
    color: "black",
    border: "1px solid var(--primary-light)",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    border: "1px solid var(--primary-light)",
  },
  [`&.${tableCellClasses.footer}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  [`&.${tableRowClasses.root}`]: {
    fontSize: 14,
    borderBottom: "none",
    borderRight: "none",
    borderLeft: "none",
  },
}));

const defaultChecklistUserValue = {
  store_visit: null as "1" | "0" | null,
  expired: null as "1" | "0" | null,
  condemned: null as "1" | "0" | null,
  status: "",
  good_points: "",
  notes: "",
  section: [] as ChecklistUserSchema["section"],
  store_duty: [] as ChecklistUserSchema["store_duty"],
  responses: [] as ChecklistUserSchema["responses"],
};

const ChecklistUserForm = forwardRef<
  ChecklistUserFormHandle,
  ChecklistUserFormProps
>(({ onSuccess, isCreateChecklistQAOpen, setIsCreateChecklistQAOpen }, ref) => {
  const { enqueueSnackbar } = useSnackbar();
  const isStoreChecklist = useLocation().pathname.includes("/store_checklist");
  const isChecklist = useLocation().pathname.includes("/checklist");
  const [sectionScore, setSectionScore] = useState(0);
  const { close: closeCreate } = useOpenCreate();
  const { close: closeUpdate } = useOpenUpdate();
  const { close: closeUser } = useOpenChecklist();
  const [imgSrc, setImgSrc] = useState("");
  const [viewImage, setViewImage] = useState(false);
  const { currentParams } = useRememberQueryParams();
  const touchedData = useSelector(
    (state: RootState) => state.qaDashboard.touchedData,
  );
  const { timeIn, setTimeIn } = useClock();
  const [timeEnd, setTimeEnd] = useState<string>("hh:mm:ss");

  const touchedChecklistData = useSelector(
    (state: RootState) => state.qaDashboard.checklistData,
  );

  const {
    data: checklistData,
    isLoading: isLoadingChecklist,
    isFetching: isFetchingChecklist,
  } = useGetChecklistQuery(
    touchedData?.store_checklist?.[0]?.checklist?.id || currentParams.id,
  );
  const {
    data: qaData,
    isLoading: isLoadingQAItem,
    isFetching: isFetchingQAItem,
  } = useGetQAQuery(
    {
      id: touchedData?.id.toString() || "",
      week: touchedChecklistData.week.slice(0, 1),
      month: (
        new Date(
          `${touchedChecklistData.month.toString()} 1, 2000`,
        ).getMonth() + 1
      ).toString(),
      year: touchedData.year.toString(),
      store_checklist_id:
        touchedData?.store_checklist?.[0]?.id.toString() || "",
    },
    {
      skip:
        touchedChecklistData.isViewStoreChecklist ||
        touchedChecklistData.isOverdueFillup ||
        touchedChecklistData.status === "Pending" ||
        touchedChecklistData.status === "Overdue",
      refetchOnMountOrArgChange: true,
    },
  );
  const { data: singleWeeklyRecord } = useGetQAQuery(
    {
      id: touchedData?.id.toString() || "",
      week: touchedChecklistData.week.slice(0, 1),
      month: (
        new Date(`${touchedData.month.toString()} 1, 2000`).getMonth() + 1
      ).toString(),
      year: touchedData.year.toString(),
      store_checklist_id:
        touchedData?.store_checklist?.[0]?.id.toString() || "",
    },
    {
      skip: !touchedChecklistData.isOverdueFillup,
    },
  );

  const weeklyRecordId =
    singleWeeklyRecord?.data?.store_checklist?.[0]?.weekly_record?.[0]?.id;
  const [users, setUsers] = useState<ChecklistUserSchema["store_duty"]>([]);
  const [openUsers, setOpenUsers] = useState<boolean>(false);
  const [getUsers, { isLoading: isLoadingStaffs }] =
    useLazyGetUsersUnpaginatedQuery();
  const [submitChecklist] = useCreateQAMutation();
  const [approveSurvey] = useResurveyMutation();
  const handleGetUsers = async () => {
    setOpenUsers(true);
    try {
      const response = await getUsers({
        status: "active",
      }).unwrap();
      const users = response.data;
      const staffs = users.filter(
        (user) => user.role.name.toLowerCase() === "staff",
      );
      const staffsTransformed = staffs.map((user) => ({
        id: user.id,
        name: user.full_name,
      }));
      setUsers(staffsTransformed);
    } catch (error) {
      const apiError = error as ApiError;
      enqueueSnackbar(apiError.detail, { variant: "error" });
    }
  };

  const {
    control,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: defaultChecklistUserValue,
    resolver: zodResolver(checklistUserSchema, { async: false }),
    criteriaMode: "all",
    mode: "onChange",
  });

  const allResponses = watch("responses");

  console.log("allResponses", allResponses);

  useEffect(() => {
    if (
      (qaData?.data?.store_checklist?.[0]?.weekly_record?.length ?? 0) > 0 &&
      !isLoadingQAItem &&
      !isFetchingQAItem &&
      !isStoreChecklist &&
      !isFetchingChecklist &&
      !isLoadingChecklist &&
      !isChecklist
    ) {
      const sections: IQAWeekAnswer =
        qaData?.data?.store_checklist?.[0]?.weekly_record?.[0]?.audit_trail?.[0]?.new_data?.checklist_snapshot?.sections.filter(
          (item) => item !== undefined,
        ) || [];

      setTimeIn(
        moment(
          qaData?.data?.store_checklist?.[0]?.weekly_record?.[0]?.start_time,
          "HH:mm:ss",
        ).format("hh:mm:ss A"),
      );
      setTimeEnd(
        moment(
          qaData?.data?.store_checklist?.[0]?.weekly_record?.[0]?.end_time,
          "HH:mm:ss",
        ).format("hh:mm:ss A"),
      );

      sections.forEach((section, sectionIndex) => {
        setValue(
          "condemned",
          qaData?.data?.store_checklist?.[0]?.weekly_record?.[0]
            ?.audit_trail?.[0]?.new_data?.inspection_metadata?.condemned ==
            undefined
            ? null
            : qaData?.data?.store_checklist?.[0]?.weekly_record?.[0]
                ?.audit_trail?.[0]?.new_data?.inspection_metadata?.condemned ==
              "1"
            ? "1"
            : "0",
        );
        setValue(
          "expired",
          qaData?.data?.store_checklist?.[0]?.weekly_record?.[0]
            ?.audit_trail?.[0]?.new_data?.inspection_metadata?.expired ==
            undefined
            ? null
            : qaData?.data?.store_checklist?.[0]?.weekly_record?.[0]
                ?.audit_trail?.[0]?.new_data?.inspection_metadata?.expired ==
              "1"
            ? "1"
            : "0",
        );
        setValue(
          "good_points",
          qaData?.data?.store_checklist?.[0]?.weekly_record?.[0]
            ?.audit_trail?.[0]?.new_data?.inspection_metadata?.good_points ||
            "",
        );
        setValue(
          "notes",
          qaData?.data?.store_checklist?.[0]?.weekly_record?.[0]
            ?.audit_trail?.[0]?.new_data?.inspection_metadata?.notes || "",
        );
        setValue(
          "store_visit",
          qaData?.data?.store_checklist?.[0]?.weekly_record?.[0]
            ?.audit_trail?.[0]?.new_data?.inspection_metadata?.store_visit ==
            undefined
            ? null
            : qaData?.data?.store_checklist?.[0]?.weekly_record?.[0]
                ?.audit_trail?.[0]?.new_data?.inspection_metadata
                ?.store_visit == "1"
            ? "1"
            : "0",
        );
        setValue(
          "store_duty",
          qaData?.data?.store_checklist?.[0]?.weekly_record?.[0]?.audit_trail?.[0]?.new_data?.inspection_metadata?.store_duties.map(
            (staff) => ({ id: staff.id, name: staff.full_name }),
          ) || [],
        );
        setValue(
          `section.${sectionIndex}.category_id`,
          qaData?.data?.store_checklist?.[0]?.weekly_record?.[0]
            ?.audit_trail?.[0]?.new_data?.checklist_snapshot?.sections?.[
            sectionIndex
          ].category_id || 0,
        );
        setSectionScore(Number(section.section_score));
      });
      const rows: ChecklistUserSchema["responses"] = sections
        .flatMap((section, questionIndex) => {
          return section.questions.map((question, questionIndex) => {
            if (!question.response) {
              return undefined;
            }
            if (question.question_type === "checkboxes") {
              const answerLen = question.response.answer
                .toString()
                .split(",").length;
              const selectedCheckboxes = [];
              for (let i = 0; i < answerLen; i++) {
                selectedCheckboxes.push({
                  answer: question.response.answer.toString().split(",")[i],
                  answer_text: question.response.answer_text
                    .toString()
                    .split(",")[i],
                });
              }
              return {
                answer: {
                  type: "checkboxes" as const,
                  data: selectedCheckboxes,
                },
                remarks: question.response.remarks,
                attachment: question.response.attachment?.file_url,
              };
            } else if (question.question_type === "multiple_choice") {
              return {
                answer: {
                  type: "multiple_choice" as const,
                  data: {
                    answer: question.response.answer,
                    answer_text: question.response.answer_text,
                  },
                },
                remarks: question.response.remarks,
                attachment: question.response.attachment?.file_url,
              };
            } else if (question.question_type === "paragraph") {
              return {
                answer: {
                  type: "paragraph" as const,
                  data: question.response.answer_text,
                },
                remarks: question.response.remarks,
                attachment: question.response.attachment?.file_url,
              };
            }
            return undefined;
          });
        })
        .filter(
          (item): item is Exclude<typeof item, undefined> => item !== undefined,
        );
      rows.forEach((row, questionIndex) => {
        setValue(`responses.${questionIndex}.answer`, row.answer);
        setValue(`responses.${questionIndex}.remarks`, row.remarks);
        setValue(`responses.${questionIndex}.attachment`, row.attachment);
      });
    } else if (
      ((qaData?.data?.store_checklist?.[0]?.weekly_record?.length ?? 0) == 0 &&
        isStoreChecklist) ||
      isChecklist
    ) {
      const sections: IQAAnswers["new_data"]["checklist_snapshot"]["sections"] =
        qaData?.data?.store_checklist?.[0]?.weekly_record?.[0]?.audit_trail?.[0]
          ?.new_data.checklist_snapshot?.sections || [];
      const rows: ChecklistUserSchema["responses"] = sections.flatMap(
        (section, sectionIndex) => {
          setValue("condemned", null);
          setValue("expired", null);
          setValue("good_points", "");
          setValue("notes", "");
          setValue("store_visit", null);
          setValue("store_duty", []);
          setSectionScore(Number(section.section_score));
          return section.questions.map((question, questionIndex) => {
            return {
              question_type: question.question_type,
              section_id: section.id,
              question_id: question.id,
              question_text: question.question_text,
              question_order_index: questionIndex + 1,
              answer: {
                type: "multiple_choice",
                data: {
                  answer: -1,
                  answer_text: "",
                },
              },
              remarks: "",
              attachment: null,
            };
          });
        },
      );
      setValue("responses", rows);
    }
  }, [
    isStoreChecklist,
    checklistData,
    setValue,
    isFetchingQAItem,
    isLoadingQAItem,
    touchedData,
    qaData?.data,
    isChecklist,
    isFetchingChecklist,
    isLoadingChecklist,
    setTimeIn,
  ]);

  const renderRemarks = (currentIndex: number) => {
    const watchedResponse = watch(`responses.${currentIndex}`);

    console.log(watchedResponse);
    return (
      <Controller
        name={`responses.${currentIndex}.remarks`}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            multiline
            rows={2}
            fullWidth
            placeholder="Enter your response"
            size="small"
            disabled={
              isStoreChecklist ||
              isChecklist ||
              (qaData?.data?.store_checklist?.[0]?.weekly_record?.length ??
                0) != 0 ||
              !touchedChecklistData.isOverdueFillup ||
              (watchedResponse?.answer?.type == "multiple_choice" &&
                watchedResponse?.answer?.data?.answer == 1)
            }
          />
        )}
      />
    );
  };

  const renderOption = (
    options: DisplayChecklistUserRows["questions"][number]["options"],
    currentIndex: number,
    questionType: "multiple_choice" | "checkboxes" | "paragraph",
    control: Control<ChecklistUserSchema>,
  ) => {
    if (questionType === "multiple_choice") {
      return (
        <Controller
          name={`responses.${currentIndex}.answer`}
          control={control}
          render={({ field: { value, onChange, ...rest } }) => {
            const selectedAnswerIndex =
              (value?.data?.answer as {
                answer: string | number;
                answer_text: string;
              }) ?? "";
            return (
              <>
                <RadioGroup
                  value={selectedAnswerIndex}
                  onChange={(_, newValue) => {
                    const selectedOption = options.find(
                      (opt) => opt.order_index.toString() === newValue,
                    );
                    if (selectedOption) {
                      onChange({
                        type: questionType,
                        data: {
                          answer: selectedOption.order_index,
                          answer_text: selectedOption.option_text,
                        },
                      });
                    }
                  }}
                  {...rest}
                  row>
                  {options.map((option) => {
                    return (
                      <FormControlLabel
                        key={option.id}
                        value={option.order_index.toString()}
                        label={option.option_text}
                        control={<Radio />}
                        disabled={
                          isStoreChecklist ||
                          isChecklist ||
                          (qaData?.data?.store_checklist?.[0]?.weekly_record
                            ?.length ?? 0) != 0 ||
                          !touchedChecklistData.isOverdueFillup
                        }
                      />
                    );
                  })}
                </RadioGroup>
                <Typography variant="body1" color="error">
                  {errors?.responses?.[currentIndex]?.answer?.message}
                </Typography>
              </>
            );
          }}
        />
      );
    } else if (questionType === "checkboxes") {
      return (
        <Controller
          name={`responses.${currentIndex}.answer`}
          control={control}
          render={({ field: { value, onChange } }) => {
            const currentData = Array.isArray(value?.data) ? value.data : [];
            return (
              <>
                {options.map((option) => {
                  const isSelected = currentData.some(
                    (item) => item.answer == option.order_index,
                  );
                  return (
                    <FormControlLabel
                      key={option.id}
                      label={option.option_text}
                      disabled={
                        isStoreChecklist ||
                        isChecklist ||
                        (qaData?.data?.store_checklist?.[0]?.weekly_record
                          ?.length ?? 0) != 0 ||
                        !touchedChecklistData.isOverdueFillup
                      }
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            let newSelection;
                            if (e.target.checked) {
                              newSelection = [
                                ...currentData,
                                {
                                  answer: option.order_index,
                                  answer_text: option.option_text,
                                },
                              ];
                            } else {
                              newSelection = currentData.filter(
                                (item) => item.answer != option.order_index,
                              );
                            }
                            onChange({
                              type: "checkboxes",
                              data: newSelection,
                            });
                          }}
                        />
                      }
                    />
                  );
                })}
                <Typography variant="body1" color="error">
                  {errors?.responses?.[currentIndex]?.answer?.message}
                </Typography>
              </>
            );
          }}
        />
      );
    } else if (questionType === "paragraph") {
      return (
        <Controller
          name={`responses.${currentIndex}.answer`}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value?.data || ""}
              onChange={(e) => {
                field.onChange({
                  type: "paragraph",
                  data: e.target.value,
                });
              }}
              multiline
              rows={3}
              fullWidth
              disabled={
                isStoreChecklist ||
                isChecklist ||
                (qaData?.data?.store_checklist?.[0]?.weekly_record?.length ??
                  0) != 0 ||
                !touchedChecklistData.isOverdueFillup
              }
              placeholder="Enter your response"
              size="small"
              error={!!errors?.responses?.[currentIndex]?.answer}
              helperText={errors?.responses?.[currentIndex]?.answer?.message}
            />
          )}
        />
      );
    }
    return (
      <Typography variant="body2" color="error">
        No set of question(s) available
      </Typography>
    );
  };

  const renderSections = (
    control: Control<ChecklistUserSchema>,
    renderOption: (
      options: DisplayChecklistUserRows["questions"][number]["options"],
      currentIndex: number,
      questionType: "multiple_choice" | "checkboxes" | "paragraph",
      control: Control<ChecklistUserSchema>,
    ) => React.JSX.Element,
  ) => {
    let globalQuestionIndex = 0;
    return checklistData?.data?.sections.map((section, sectionIndex) => {
      const questions = section.questions;
      const row = questions.map((question, questionIndex) => {
        const currentIndex = globalQuestionIndex;
        globalQuestionIndex++;
        return (
          <StyledTableRow key={currentIndex}>
            <StyledTableCell sx={{ width: "min-content" }}>
              <Typography variant="body2">
                {section.category?.name || "N/A"}
              </Typography>
            </StyledTableCell>
            <StyledTableCell sx={{ width: "30%" }}>
              <Typography variant="body2">
                {questionIndex + 1}. {question.question_text}
              </Typography>
            </StyledTableCell>
            <StyledTableCell sx={{ width: "17%" }}>
              {renderOption
                ? renderOption(
                    question.options,
                    currentIndex,
                    question.question_type as
                      | "multiple_choice"
                      | "checkboxes"
                      | "paragraph",
                    control,
                  )
                : null}
            </StyledTableCell>
            <StyledTableCell>{renderRemarks(currentIndex)}</StyledTableCell>
            <StyledTableCell>
              <Controller
                name={`responses.${currentIndex}.attachment`}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Grid size={12} container justifyContent="center">
                    <Grid size={7}>
                      <IconButton
                        component="label"
                        sx={{
                          backgroundColor: value ? "var(--primary-light)" : "",
                          margin: "0 auto",
                          display: "block",
                          width: "min-content",
                          height: "42px",
                        }}
                        disabled={
                          ((isStoreChecklist ||
                            isChecklist ||
                            (qaData?.data?.store_checklist?.[0]?.weekly_record
                              ?.length ?? 0) != 0 ||
                            !touchedChecklistData.isOverdueFillup ||
                            viewImage) &&
                            !value) ||
                          (allResponses[currentIndex]?.answer?.type ==
                            "multiple_choice" &&
                            allResponses[currentIndex]?.answer?.data?.answer ==
                              1)
                        }
                        onClick={() => {
                          if (
                            isStoreChecklist ||
                            isChecklist ||
                            (qaData?.data?.store_checklist?.[0]?.weekly_record
                              ?.length ?? 0) != 0 ||
                            value
                          ) {
                            setViewImage(true);
                            setImgSrc(value as string);
                          }
                        }}>
                        <FileImage />
                        {!value && (
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) onChange(file);
                            }}
                          />
                        )}
                      </IconButton>
                    </Grid>
                    {value ? (
                      <>
                        {touchedChecklistData.isViewStoreChecklist && (
                          <Grid
                            size={5}
                            display="flex"
                            justifyContent="center"
                            alignItems="center">
                            <Typography
                              sx={{
                                marginTop: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor:
                                  isStoreChecklist ||
                                  isChecklist ||
                                  (qaData?.data?.store_checklist?.[0]
                                    ?.weekly_record?.length ?? 0) != 0
                                    ? "lightgray"
                                    : "pink",
                                height: "25px",
                                width: "25px",
                                borderRadius: "50%",
                              }}>
                              <X
                                size={16}
                                onClick={() => {
                                  if (
                                    isStoreChecklist ||
                                    isChecklist ||
                                    (qaData?.data?.store_checklist?.[0]
                                      ?.weekly_record?.length ?? 0) != 0
                                  ) {
                                    return;
                                  }
                                  onChange(null);
                                }}></X>
                            </Typography>
                          </Grid>
                        )}
                        <Grid size={12}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                height: "20px",
                                whiteSpace: "nowrap",
                                paddingLeft: "5px",
                                textAlign: "center",
                              }}>
                              {!touchedChecklistData.isViewStoreChecklist
                                ? "View File"
                                : ""}
                            </Typography>
                          </Box>
                        </Grid>
                      </>
                    ) : (
                      <Typography
                        variant="body2"
                        color="black"
                        sx={{ display: "flex", alignItems: "center" }}>
                        No file
                      </Typography>
                    )}
                  </Grid>
                )}
              />
            </StyledTableCell>
          </StyledTableRow>
        );
      });
      return (
        <TableContainer
          key={sectionIndex}
          component={Paper}
          sx={{ border: "1px solid var(--primary-light)" }}>
          <Typography
            sx={{
              backgroundColor: "var(--primary-main)",
              color: "white",
              padding: "1rem",
            }}
            variant="h6">
            {section.title}{" "}
            {section.category?.name
              ? `- Category: ${section.category?.name}`
              : ""}
          </Typography>
          <Table
            sx={{
              [`& .${tableCellClasses.root}`]: {
                border: "none",
              },
            }}>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell>
                  <Typography variant="h6">Category</Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <Typography variant="h6">Item</Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <Typography variant="h6">Compliance</Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <Typography variant="h6">Remarks</Typography>
                </StyledTableCell>
                <StyledTableCell></StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>{row}</TableBody>
          </Table>
        </TableContainer>
      );
    });
  };

  const answerSurveyApproveHandler = useCallback(
    async (id: number | string, data: FormData) => {
      const response = await approveSurvey({ id, body: data }).unwrap();
      enqueueSnackbar({
        variant: "success",
        message: response?.message ?? "Region Created successfully!",
      });
      onSuccess?.();
    },
    [approveSurvey, enqueueSnackbar, onSuccess],
  );
  const answerChecklistHandler = useCallback(
    async (data: FormData) => {
      const response = await submitChecklist(data).unwrap();
      enqueueSnackbar({
        variant: "success",
        message: response?.message ?? "Checklist Created successfully!",
      });
      onSuccess?.();
    },
    [submitChecklist, enqueueSnackbar, onSuccess],
  );
  const handleSurveyApprove = useCallback(
    async (id: string | number, data: FormData) => {
      try {
        await answerSurveyApproveHandler(id, data);
      } catch (error: ApiErrorResponse | unknown) {
        if (isApiErrorResponse(error))
          error?.data?.errors.forEach((err: ApiError) => {
            enqueueSnackbar({ variant: "error", message: err.detail });
          });
        throw error;
      }
    },
    [answerSurveyApproveHandler, enqueueSnackbar, closeUser],
  );
  const handleChecklistSubmit = useCallback(
    async (data: FormData) => {
      try {
        await answerChecklistHandler(data);
      } catch (error: ApiErrorResponse | unknown) {
        if (isApiErrorResponse(error))
          error?.data?.errors.forEach((err: ApiError) => {
            enqueueSnackbar({ variant: "error", message: err.detail });
          });
        throw error;
      }
    },
    [answerChecklistHandler, enqueueSnackbar, closeUpdate, closeCreate],
  );
  const submitForm = useCallback(async () => {
    return handleSubmit(async (data: ChecklistUserSchema) => {
      let globalIndexAnswers = -1;
      const payload: QADashboardPayloadSchema = {
        store_id: touchedData?.id || 0,
        status: "",
        store_checklist_id: touchedData?.store_checklist?.[0]?.id || 0,
        store_duty_id: data.store_duty.map((storeItem) => storeItem.id),
        store_visit: data.store_visit,
        checklist_id: Number(touchedData?.store_checklist?.[0]?.checklist?.id),
        code: touchedData?.store_checklist?.[0]?.code || "",
        condemned: data.condemned,
        expired: data.expired,
        good_points: data.good_points || "",
        notes: data.notes || "",
        section:
          checklistData?.data.sections.map((section, sectionIndex) => ({
            section_id: section.id,
            section_order_index: sectionIndex + 1,
          })) || [],
        response: checklistData
          ? checklistData?.data?.sections.flatMap((section, sectionIndex) =>
              section.questions.map((question, questionIndex) => {
                globalIndexAnswers++;
                return {
                  section_id: section.id,
                  question_id: section.questions[questionIndex].id,
                  question_order_index: questionIndex + 1,
                  question_text: section.questions[questionIndex].question_text,
                  question_type: section.questions[questionIndex].question_type,
                  answer:
                    data.responses[globalIndexAnswers].answer.type ===
                    "checkboxes"
                      ? data.responses[globalIndexAnswers].answer.data.map(
                          (val) => val.answer,
                        )
                      : data.responses[globalIndexAnswers].answer.type ===
                        "multiple_choice"
                      ? data.responses[globalIndexAnswers].answer.data.answer
                      : null,
                  answer_text:
                    data.responses[globalIndexAnswers].answer.type ===
                    "checkboxes"
                      ? data.responses[globalIndexAnswers].answer.data.map(
                          (val) => val.answer_text,
                        )
                      : data.responses[globalIndexAnswers].answer.type ===
                        "multiple_choice"
                      ? data.responses[globalIndexAnswers].answer.data
                          .answer_text
                      : data.responses[globalIndexAnswers].answer.data,
                  remarks: data.responses[globalIndexAnswers].remarks || "",

                  attachment:
                    data.responses[globalIndexAnswers].attachment || null,
                };
              }),
            )
          : [],
      };
      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (key === "response" && Array.isArray(value)) {
          value.forEach((resp, index) => {
            Object.entries(resp).forEach(([respKey, respValue]) => {
              if (respKey === "attachment" && respValue instanceof File) {
                formData.append(`responses[${index}][attachment]`, respValue);
              } else if (respKey !== "attachment") {
                formData.append(
                  `responses[${index}][${respKey}]`,
                  String(respValue ?? ""),
                );
              }
            });
          });
        } else {
          if (key === "store_duty_id") {
            value.forEach((id: number, index: number) => {
              formData.append(`store_duty_id[${index}]`, String(id));
            });
          } else {
            formData.append(key, String(value ?? ""));
          }
        }
      });
      setTimeEnd(moment().format("HH:mm:ss"));
      const timeExit = moment().format("HH:mm:ss");
      formData.append(
        "start_time",
        moment(timeIn, "HH:mm:ss A").format("HH:mm:ss"),
      );
      formData.append("end_time", timeExit);
      try {
        const isOverdued =
          !!singleWeeklyRecord?.data?.store_checklist?.[0]?.weekly_record?.[0]
            ?.weekly_skipped;
        if (isOverdued && touchedChecklistData?.isOverdueFillup) {
          formData.append("_method", "PATCH");
          await handleSurveyApprove(weeklyRecordId?.toString() || "", formData);
          if (isCreateChecklistQAOpen.open)
            setIsCreateChecklistQAOpen({ open: false, id: "" });
        } else {
          await handleChecklistSubmit(formData);
        }
      } catch (error) {
        console.error("Form submission error:", error);
        throw error;
      }
    })();
  }, [
    handleSubmit,
    touchedData?.store_checklist,
    handleChecklistSubmit,
    checklistData,
    touchedData?.id,
    handleSurveyApprove,
    touchedChecklistData?.isOverdueFillup,
    weeklyRecordId,
    singleWeeklyRecord?.data?.store_checklist,
    timeIn,
  ]);

  const resetForm = useCallback(() => {
    reset();
  }, [reset]);

  useImperativeHandle(
    ref,
    () => ({
      submitForm,
      resetForm,
      isLoadingQAItem,
    }),
    [submitForm, resetForm, isLoadingQAItem],
  );

  if (
    isLoadingChecklist ||
    isFetchingChecklist ||
    isLoadingQAItem ||
    isFetchingQAItem
  ) {
    return <AuroraSpinner />;
  }
  return (
    <>
      <ViewImageDialog
        viewImage={viewImage}
        setViewImage={setViewImage}
        imgSrc={imgSrc}
        setImgSrc={setImgSrc}
      />
      <Box component="form" noValidate sx={{ mt: 1 }}>
        <Grid container spacing={2} size={12}>
          <Grid size={6}>
            <Typography variant="h6">{checklistData?.data?.name}</Typography>
          </Grid>
          {currentParams.dg !== "view-checklist-user" && (
            <Grid container size={12}>
              <Grid size={6}>
                <Typography
                  variant="body1"
                  sx={{
                    backgroundColor: "lightgray",
                    width: "max-content",
                    padding: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    borderRadius: "10px",
                  }}>
                  <Clock />
                  Time In: {timeIn === "Invalid date" ? "00:00:00" : timeIn}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography
                  variant="body1"
                  sx={{
                    backgroundColor: "lightgray",
                    width: "max-content",
                    padding: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginLeft: "auto",
                    borderRadius: "10px",
                  }}>
                  <Clock />
                  Time Out: {timeEnd == "Invalid date" ? "00:00:00" : timeEnd}
                </Typography>
              </Grid>
            </Grid>
          )}
          {renderSections(control, renderOption)}
          <Grid container size={12} spacing={2}>
            <Box
              sx={{
                width: "100%",
                backgroundColor: "var(--primary-main)",
                borderRadius: "8px",
              }}>
              <Typography variant="h6" sx={{ color: "white", padding: "1rem" }}>
                Others
              </Typography>
              <Box
                sx={{
                  backgroundColor: "white",
                  padding: "1rem",
                }}>
                <FormLabel>Store Visit</FormLabel>
                <Controller
                  name="store_visit"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Box
                        component={Paper}
                        sx={{
                          padding: "0.5rem",
                          mt: 1,
                          display: "flex",
                          justifyContent: "center",
                          border: "1px solid var(--primary-main)",
                        }}>
                        <RadioGroup {...field} row>
                          <FormControlLabel
                            value="1"
                            label="Yes"
                            control={<Radio />}
                            disabled={
                              isStoreChecklist ||
                              isChecklist ||
                              (qaData?.data?.store_checklist?.[0]?.weekly_record
                                ?.length ?? 0) != 0 ||
                              !touchedChecklistData.isOverdueFillup
                            }
                          />
                          <FormControlLabel
                            value="0"
                            label="No"
                            control={<Radio />}
                            disabled={
                              isStoreChecklist ||
                              isChecklist ||
                              (qaData?.data?.store_checklist?.[0]?.weekly_record
                                ?.length ?? 0) != 0 ||
                              !touchedChecklistData.isOverdueFillup
                            }
                          />
                        </RadioGroup>
                      </Box>
                    );
                  }}
                />
              </Box>
              <Box
                sx={{
                  backgroundColor: "white",
                  padding: "1rem",
                }}>
                <FormLabel>Expired</FormLabel>
                <Controller
                  name="expired"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Box
                        component={Paper}
                        sx={{
                          padding: "0.5rem",
                          mt: 1,
                          display: "flex",
                          justifyContent: "center",
                          border: "1px solid var(--primary-main)",
                        }}>
                        <RadioGroup {...field} row>
                          <FormControlLabel
                            value="0"
                            label="without expired items"
                            control={
                              <Radio
                                disabled={
                                  isStoreChecklist ||
                                  isChecklist ||
                                  (qaData?.data?.store_checklist?.[0]
                                    ?.weekly_record?.length ?? 0) != 0 ||
                                  !touchedChecklistData.isOverdueFillup
                                }
                              />
                            }
                            disabled={
                              isStoreChecklist ||
                              isChecklist ||
                              (qaData?.data?.store_checklist?.[0]?.weekly_record
                                ?.length ?? 0) != 0 ||
                              !touchedChecklistData.isOverdueFillup
                            }
                          />
                          <FormControlLabel
                            value="1"
                            label="with expired items"
                            control={
                              <Radio
                                disabled={
                                  isStoreChecklist ||
                                  isChecklist ||
                                  (qaData?.data?.store_checklist?.[0]
                                    ?.weekly_record?.length ?? 0) != 0 ||
                                  !touchedChecklistData.isOverdueFillup
                                }
                              />
                            }
                            disabled={
                              isStoreChecklist ||
                              isChecklist ||
                              (qaData?.data?.store_checklist?.[0]?.weekly_record
                                ?.length ?? 0) != 0 ||
                              !touchedChecklistData.isOverdueFillup
                            }
                          />
                        </RadioGroup>
                      </Box>
                    );
                  }}
                />
              </Box>
              <Box
                sx={{
                  backgroundColor: "white",
                  padding: "1rem",
                }}>
                <FormLabel>Condemned</FormLabel>
                <Controller
                  name="condemned"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Box
                        component={Paper}
                        sx={{
                          padding: "0.5rem",
                          mt: 1,
                          display: "flex",
                          justifyContent: "center",
                          border: "1px solid var(--primary-main)",
                        }}>
                        <RadioGroup {...field} row>
                          <FormControlLabel
                            value="0"
                            label="without condemned items"
                            control={<Radio />}
                            disabled={
                              isStoreChecklist ||
                              isChecklist ||
                              (qaData?.data?.store_checklist?.[0]?.weekly_record
                                ?.length ?? 0) != 0 ||
                              !touchedChecklistData.isOverdueFillup
                            }
                          />
                          <FormControlLabel
                            value="1"
                            label="with condemned items"
                            control={<Radio />}
                            disabled={
                              isStoreChecklist ||
                              isChecklist ||
                              (qaData?.data?.store_checklist?.[0]?.weekly_record
                                ?.length ?? 0) != 0 ||
                              !touchedChecklistData.isOverdueFillup
                            }
                          />
                        </RadioGroup>
                      </Box>
                    );
                  }}
                />
              </Box>
              <Box
                sx={{
                  backgroundColor: "white",
                  padding: "1rem",
                }}>
                <FormLabel>Staff on Duty</FormLabel>
                <Controller
                  name={`store_duty`}
                  control={control}
                  render={({ field: { value, onChange } }) => {
                    return (
                      <Autocomplete
                        disabled={
                          isStoreChecklist ||
                          isChecklist ||
                          (qaData?.data?.store_checklist?.[0]?.weekly_record
                            ?.length ?? 0) != 0 ||
                          !touchedChecklistData.isOverdueFillup
                        }
                        multiple
                        options={users || []}
                        onOpen={handleGetUsers}
                        open={openUsers}
                        onClose={() => setOpenUsers(false)}
                        onChange={(event, newValue) => {
                          onChange(newValue);
                        }}
                        value={value}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        loading={isLoadingStaffs}
                        loadingText="Loading staffs..."
                        sx={{ width: "100%" }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            sx={{
                              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "var(--primary-main)",
                                },
                              "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "var(--primary-light)",
                                },
                            }}
                          />
                        )}
                      />
                    );
                  }}
                />
                <Typography
                  sx={{
                    color: errors?.store_duty ? "error.main" : "inherit",
                    marginY: "0.5rem",
                  }}>
                  {errors?.store_duty?.message}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: "white",
                  padding: "1rem",
                }}>
                <FormLabel>Good Points</FormLabel>
                <Controller
                  name={`good_points`}
                  control={control}
                  render={({ field }) => {
                    return (
                      <TextField
                        fullWidth
                        rows={5}
                        {...field}
                        disabled={
                          isStoreChecklist ||
                          isChecklist ||
                          (qaData?.data?.store_checklist?.[0]?.weekly_record
                            ?.length ?? 0) != 0 ||
                          !touchedChecklistData.isOverdueFillup
                        }
                        sx={{
                          "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "var(--primary-main)",
                            },
                          "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "var(--primary-light)",
                            },
                        }}
                      />
                    );
                  }}
                />
              </Box>
              <Box
                sx={{
                  backgroundColor: "white",
                  padding: "1rem",
                }}>
                <FormLabel>Notes</FormLabel>
                <Controller
                  name={`notes`}
                  control={control}
                  render={({ field }) => {
                    return (
                      <TextField
                        fullWidth
                        rows={5}
                        disabled={
                          isStoreChecklist ||
                          isChecklist ||
                          (qaData?.data?.store_checklist?.[0]?.weekly_record
                            ?.length ?? 0) != 0 ||
                          !touchedChecklistData.isOverdueFillup
                        }
                        {...field}
                        sx={{
                          "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "var(--primary-main)",
                            },
                          "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "var(--primary-light)",
                            },
                        }}
                      />
                    );
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
});

export default ChecklistUserForm;
