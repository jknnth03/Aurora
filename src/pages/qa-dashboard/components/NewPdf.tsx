import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import GlobalStyles from "@mui/material/GlobalStyles";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { intToRoman } from "@scottobert/roman-numerals";
import moment from "moment";

type weeklyRecordType = {
  approver_remarks: string;
  id: number;
  store_checklist_id: number;
  week: number;
  month: number;
  year: number;
  start_time: string;
  end_time: string;
  weekly_grade: string;
  is_auto_grade: boolean;
  grade_source: string;
  graded_by: {
    id: number;
    id_prefix: string;
    id_no: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string | null;
    position_name: string;
    mobile_number: string;
    gender: string;
    one_charging_id: number;
    one_charging_sync_id: number | null;
    one_charging_code: string | null;
    one_charging_name: string | null;
    username: string;
    role_id: number;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
  };
  status: string;
  grade_notes: null;
  store_visit: number;
  condemned: number;
  create_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  for_approval_reason: string | null;
  audit_trail: Array<{
    id: 6;
    module_type: string;
    module_name: string;
    module_id: number;
    action: string;
    action_by: number;
    action_by_name: string;
    log_info: string;
    previous_data: string | null;
    new_data: {
      inspection_metadata: {
        week: number;
        month: number;
        year: number;
        inspection_date: string | null;
        inspector: {
          id: number;
          full_name: string;
          employee_id: string;
        };
        store: {
          id: number;
          code: string;
          name: string;
        };
        area: {
          id: number;
          name: string;
        };
        region: {
          id: number;
          name: string;
        };
        store_duties: Array<{
          id: number;
          employee_id: string;
          first_name: string;
          last_name: string;
          full_name: string;
        }>;
        status: string;
        store_visit: string;
        expired: string;
        condemned: string;
        good_points: string;
        notes: string;
      };
      checklist_snapshot: {
        id: number;
        code: string;
        name: string;
        sections: Array<{
          id: number;
          category_id: number;
          category_name: string;
          title: string;
          description: string | null;
          order_index: number;
          grade: {
            max_points: number;
            earned_points: number;
            percentage: number;
            total_questions: number;
          };
          questions: Array<{
            id: number;
            question_type: string;
            question_text: string;
            order_index: number;
            options: Array<{
              id: number;
              option_text: string;
              order_index: number;
              score_rating_id: number;
              score_rating: {
                id: number;
                rating: number;
                score: number;
              };
            }>;
            response: {
              question_type: "multiple_choice";
              answer: string;
              answer_text: string;
              remarks: string;
              attachment: {
                file_name: string;
                file_path: string;
                file_url: string;
                original_name: string;
                mime_type: string;
                size: number;
              };
              selected_option: {
                id: number;
                option_text: string;
                score_rating_id: number;
                score_rating: {
                  id: number;
                  rating: number;
                  score: number;
                };
              };
            };
          }>;
        }>;
      };
      grade_summary: {
        total_grade: number;
        total_score: number;
        max_score: number;
        percentage: number;
        total_sections: number;
        points_per_section: number;
      };
    };
    remarks: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
  }>;
  weekly_skipped: {
    id: number;
    weekly_id: number;
    week: number;
    month: number;
    year: number;
    approver_id: number;
    approver_name: string;
    approved_at: string | null;
    rejected_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
  };
};

type transformedFindingsType = {
  sectionTitle: string;
  questions: {
    remarks: string;
    grade: number;
    attachments: string;
  }[];
}[];

type scoresForFindingsType = {
  totalItems: number;
  totalPerfect: number;
  sectionNum: number;
  totalScore: number;
}[];

type storeDutiesType = {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
}[];

const styles = `
  #pdf-render-container .printTitleOffset {
    margin-top: 5mm !important;
  }

  #pdf-render-container .printContainer {
    padding-top: 0 !important;
    background-color: white !important;
    width: 210mm;
    color: black;
  }

  #pdf-render-container .printPageBox {
    break-after: page !important;
    page-break-after: always !important;
    border: 2.5px solid var(--primary-main) !important;
    border-radius: 0.5rem !important;

    /* ADJUST THIS: padding-top moves the photos DOWN from the top border */
    padding: 2rem 1.5rem 1.5rem 1.5rem !important;

    /* margin-bottom adds space between pairs if they appear on the same page */
    margin-bottom: 40px !important;

    position: relative !important;
    min-height: 200mm !important;
    max-height: 265mm !important;
    background-color: white !important;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  #pdf-render-container .printPageBox::before {
    content: "Photo Attachments";
    position: absolute;
    top: -15px; /* Pulls it slightly above the top border line */
    left: 20px;
    width: 11rem;
    text-align: center;
    color: black;
    background-color: white; /* Prevents border from cutting through text */
    font-size: 1rem;
    font-weight: bold;
    z-index: 10;
    border: 2.5px solid var(--primary-main);
    border-radius: 5rem;
  }

  #pdf-render-container.photoContainer {
    width: "100%",
    height: "110mm", // Ensures 2 photos + labels fit perfectly
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  }
  #pdf-render-container .imageBox {
    border: "2px solid #e0e0e0",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  }
  #pdf-render-container .imgStyle {
    height: "100%",
    width: "100%",
    objectFit: "contain" as "const",
  }
  #pdf-render-container .noOverflow {
    overflow: visible !important;
    height: auto !important;
  }

  #pdf-render-container .printHeight {
    height: "initial !important",
  }
  #pdf-render-container .printHeightMeta {
    height: "75vh !important",
  }
  #pdf-render-container .photoSectionWeb {
    borderRadius: "0.5rem",
    position: "relative",
    backgroundColor: "white",
    border: "none !important",
    padding: "0 !important",
  }
  #pdf-render-container .webLabel {
    display: "none !important",
    top: "0.7rem !important",
  }
`;

const NewPdf = ({
  targetRef,
  weeklyRecord,
  transformedFindings,
  imageMap,
  notes,
  goodPoints,
  scoresForFindings,
  dateCreated,
  timeIn,
  timeOut,
  areaRecord,
  storeDuties,
  inspectorName,
  fullWordDifference,
}: {
  targetRef: React.RefObject<HTMLDivElement>;
  weeklyRecord?: weeklyRecordType;
  transformedFindings?: transformedFindingsType;
  imageMap: Record<string, string>;
  notes?: string;
  goodPoints?: string;
  scoresForFindings?: scoresForFindingsType;
  dateCreated?: string;
  timeIn?: string;
  timeOut?: string;
  areaRecord?: string;
  storeDuties?: storeDutiesType;
  inspectorName?: string;
  fullWordDifference?: string;
}) => {
  // Use your primary color variable here

  // Logic to pair images: 2 per page
  const allQuestionsWithImages =
    transformedFindings?.flatMap((finding) =>
      finding.questions
        .map((q, originalIndex) => ({
          ...q,
          originalIndex: originalIndex + 1,
          sectionTitle: finding.sectionTitle,
        }))
        .filter((q) => q.attachments)
    ) || [];

  const photoPairs = [];
  for (let i = 0; i < allQuestionsWithImages.length; i += 2) {
    photoPairs.push(allQuestionsWithImages.slice(i, i + 2));
  }

  return (
    <>
      <GlobalStyles styles={styles} />

      {/* Hidden container for usePDF */}
      <Box
        id="pdf-render-container"
        ref={targetRef}
        sx={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "210mm",
          backgroundColor: "white",
        }}
      >
        <DialogTitle>
          <Grid container size={12} className="printTitleOffset">
            <Grid size={6}>
              <Typography fontWeight="regular" variant="h5">
                {weeklyRecord?.weekly_grade}% - Report Summary
              </Typography>
            </Grid>
            <Box
              sx={{
                border: "2px solid var(--primary-main)",
                width: "100%",
                marginY: "1rem",
                marginBottom: 0,
              }}
            ></Box>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Grid
            container
            sx={{ paddingY: "1rem", overflowY: "auto", mb: "150px" }}
            spacing={4}
            size={12}
            className="noOverflow"
          >
            <Grid size={8}>
              <Box
                sx={{
                  backgroundColor: "white",
                  border: "2.5px solid var(--primary-main)",
                  width: "100%",
                  height: "170px",
                  borderRadius: "0.5rem",
                  position: "relative",
                  zIndex: "0",
                  padding: "1.1rem",
                }}
              >
                <Typography
                  sx={{
                    color: "black",
                    position: "absolute",
                    top: "-8%",
                    left: "2%",
                    zIndex: "1",
                    width: "7rem",
                    textAlign: "center",
                    height: "min-content",
                    backgroundColor: "#fff9ee",
                    borderRadius: "5rem",
                  }}
                >
                  Good Points
                </Typography>
                <Typography>{goodPoints || ""}</Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: "white",
                  border: "2.5px solid var(--primary-main)",
                  color: "var(--primary-main)",
                  width: "100%",
                  borderRadius: "0.5rem",
                  position: "relative",
                  zIndex: "0",
                  marginTop: "1rem",
                  padding: "1.1rem",
                }}
                className="printHeight"
              >
                <Typography
                  sx={{
                    color: "black",
                    position: "absolute",
                    top: "-0.8rem",
                    left: "0.8rem",
                    zIndex: "1",
                    width: "5rem",
                    textAlign: "center",
                    minHeight: "min-content",
                    backgroundColor: "#fff9ee",
                    borderRadius: "5rem",
                  }}
                >
                  Findings
                </Typography>
                <Box
                  overflow={"auto"}
                  sx={{ height: "100%", width: "100%", color: "black" }}
                  className="noOverflow"
                >
                  {transformedFindings?.map((finding, sectionIndex) => {
                    return (
                      <>
                        <Typography key={sectionIndex}>
                          {finding?.questions?.length > 0
                            ? intToRoman(sectionIndex + 1) +
                              ". " +
                              finding?.sectionTitle
                            : ""}
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                          {finding?.questions?.map(
                            (question, questionIndex) => (
                              <>
                                <Typography
                                  key={questionIndex}
                                  sx={{ paddingLeft: "1rem" }}
                                >
                                  {questionIndex + 1}. {question?.remarks} ( -
                                  {question?.grade.toFixed(2)}){" "}
                                </Typography>
                              </>
                            )
                          )}
                        </Box>
                      </>
                    );
                  })}
                </Box>
              </Box>

              <Grid container spacing={2} size={12} sx={{ marginTop: "1rem" }}>
                <Grid size={6}>
                  <Box
                    sx={{
                      backgroundColor: "white",
                      border: "2.5px solid var(--primary-main)",
                      color: "var(--primary-main)",
                      width: "100%",
                      minHeight: "250px",
                      borderRadius: "0.5rem",
                      position: "relative",
                      zIndex: "0",
                      padding: "1.1rem",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "black",
                        position: "absolute",
                        top: "-5%",
                        left: "2%",
                        zIndex: "1",
                        width: "4.5rem",
                        textAlign: "center",
                        height: "min-content",
                        backgroundColor: "#fff9ee",
                        borderRadius: "5rem",
                      }}
                    >
                      Notes
                    </Typography>
                    <Box
                      overflow={"auto"}
                      sx={{ height: "100%", width: "100%" }}
                      className="noOverflow"
                    >
                      <Typography color="black">{notes}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={6}>
                  <Box
                    sx={{
                      backgroundColor: "white",
                      border: "2.5px solid var(--primary-main)",
                      color: "var(--primary-main)",
                      width: "100%",
                      minHeight: "250px",
                      borderRadius: "0.5rem",
                      position: "relative",
                      zIndex: "0",
                      padding: "2rem",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "black",
                        position: "absolute",
                        top: "-5%",
                        left: "2%",
                        zIndex: "1",
                        width: "10rem",
                        textAlign: "center",
                        height: "min-content",
                        backgroundColor: "#fff9ee",
                        borderRadius: "5rem",
                      }}
                    >
                      Scores for findings
                    </Typography>
                    <Box
                      overflow={"auto"}
                      className="noOverflow"
                      sx={{
                        height: "100%",
                        width: "100%",
                        marginTop: "1rem",
                      }}
                    >
                      <Grid container size={12}>
                        {scoresForFindings?.map((findingScore, scoreIndex) => (
                          <>
                            <Grid size={6}>
                              <Typography key={scoreIndex} color="black">
                                {intToRoman(findingScore.sectionNum)} -{" "}
                                {findingScore.totalPerfect}/
                                {findingScore.totalItems}
                              </Typography>
                            </Grid>
                            <Grid size={6} textAlign={"right"}>
                              <Typography key={scoreIndex} color="black">
                                {findingScore.totalScore}
                              </Typography>
                            </Grid>
                          </>
                        ))}
                        <Grid container alignItems={"end"} size={12}>
                          <Box
                            sx={{
                              border: "2px solid var(--primary-main)",
                              width: "100%",
                              marginY: "1rem",
                            }}
                          ></Box>
                          <Grid size={6}>
                            <Typography color="black">Total:</Typography>
                          </Grid>
                          <Grid size={6} textAlign={"right"}>
                            <Typography color="black">
                              {weeklyRecord?.weekly_grade}%
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={4}>
              <Box
                sx={{
                  backgroundColor: "var(--primary-main)",
                  borderRadius: "0.5rem 0.5rem 0 0",
                  padding: "1.5rem",
                }}
                className="printHeightMeta"
              >
                <Typography color="white" fontWeight={"bold"}>
                  Details
                </Typography>
                <Typography color="white" sx={{ marginTop: "0.7rem" }}>
                  Date: {moment(dateCreated).format("MMMM DD, YYYY")}
                </Typography>
                <Typography color="white">Time in: {timeIn} </Typography>
                <Typography color="white">Time out: {timeOut} </Typography>
                <Typography color="white">Area: {areaRecord}</Typography>
                <Typography color="white">QA: </Typography>
                <Box
                  sx={{
                    width: "100%",
                    marginY: "0.5rem",
                    height: "0.3rem",
                    backgroundColor: "white",
                  }}
                ></Box>
                <Typography
                  color="white"
                  sx={{ marginBottom: "0.7rem" }}
                  fontWeight={"bold"}
                >
                  On Duty
                </Typography>
                {storeDuties?.map((staff, index) => (
                  <Typography color="white" key={index}>
                    {staff.full_name}
                  </Typography>
                ))}
                <Box
                  sx={{
                    width: "100%",
                    marginY: "0.5rem",
                    height: "0.3rem",
                    backgroundColor: "white",
                  }}
                ></Box>
                <Typography
                  color="white"
                  sx={{ marginBottom: "0.7rem" }}
                  fontWeight={"bold"}
                >
                  QA Name
                </Typography>
                <Typography color="white">{inspectorName}</Typography>
                <Box
                  sx={{
                    width: "100%",
                    marginY: "0.5rem",
                    height: "0.3rem",
                    backgroundColor: "white",
                  }}
                ></Box>
                <Typography
                  color="white"
                  sx={{ marginBottom: "0.7rem" }}
                  fontWeight={"bold"}
                >
                  Time Summary
                </Typography>
                <Typography color="white">{fullWordDifference}</Typography>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  height: "122.5px",
                  backgroundColor: "white",
                  border: "2px solid var(--primary-main)",
                  borderRadius: "0 0 0.5rem 0.5rem",
                }}
              >
                <Typography
                  sx={{
                    color: "var(--primary-main)",
                    fontWeight: "bold",
                    padding: "1rem",
                  }}
                >
                  Signed by{" "}
                  <Box
                    sx={{
                      width: "100%",
                      textAlign: "center",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  ></Box>
                  <Typography sx={{ width: "100%", textAlign: "center" }}>
                    {inspectorName}
                  </Typography>
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ breakBefore: "page" }}></Box>
          <Grid container size={12} sx={{ mt: 5 }}>
            <Grid
              size={12}
              className="photoSectionWeb"
              sx={{
                position: "relative",
                backgroundColor: "white",
                width: "100%",
                zIndex: "0",
                padding: "1.1rem",
              }}
            >
              {(() => {
                // 1. Flatten questions and capture original section indices
                const allQuestionsWithImages =
                  transformedFindings?.flatMap((finding) =>
                    finding.questions
                      .map((q, originalIndex) => ({
                        ...q,
                        originalIndex: originalIndex + 1,
                        sectionTitle: finding.sectionTitle,
                      }))
                      .filter((q) => q.attachments)
                  ) || [];

                // 2. Chunk into groups of 2
                const pairs = [];
                for (let i = 0; i < allQuestionsWithImages.length; i += 2) {
                  pairs.push(allQuestionsWithImages.slice(i, i + 2));
                }

                if (allQuestionsWithImages.length === 0) {
                  return <Alert severity="error">No Photo Attachments</Alert>;
                }

                return pairs.map((pair, pairIndex) => (
                  <>
                    <Box
                      key={pairIndex}
                      className="printPageBox"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        mb: pairIndex === pairs.length - 1 ? 0 : 4,
                      }}
                    >
                      {pair.map((question, idx) => (
                        <Box
                          key={idx}
                          sx={{ width: "100%", breakInside: "avoid" }}
                        >
                          <Typography
                            sx={{ fontWeight: "bold", mb: 1, color: "black" }}
                          >
                            {question.sectionTitle} - Question #
                            {question.originalIndex}{" "}
                            {question.remarks ? ": " + question.remarks : ""} -
                            ({question.grade})
                          </Typography>

                          <Box
                            sx={{
                              border: "5px solid var(--primary-main)",
                              textAlign: "center",
                              backgroundColor: "#f9f9f9",
                              width: "100%",
                              height: "380px", // Maintains 2 items per page ratio
                              display: "flex",
                              justifyContent: "center",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={
                                imageMap[
                                  question.attachments.split("/").pop() || ""
                                ]
                              }
                              style={{
                                height: "100%",
                                width: "auto",
                                maxWidth: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                    <Box
                      sx={{
                        height: pairs.length - 1 === pairIndex ? 0 : "170px",
                        width: "100%",
                      }}
                    />
                  </>
                ));
              })()}
            </Grid>
          </Grid>
        </DialogContent>
      </Box>
    </>
  );
};

export default NewPdf;
