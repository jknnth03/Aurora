import Box from "@mui/material/Box";
import React, { useEffect, useRef, useState } from "react";
import DialogTitle from "@mui/material/DialogTitle";
import {
  useGetQAQuery,
  useLazyGetImageQuery,
} from "../../../features/api/aurora/qa-dashboard.api";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { ResponsiveDialog } from "../../../components/ui/responsive-dialog";
import {
  DownloadSimple,
  FileImage,
  Printer,
} from "@phosphor-icons/react/dist/ssr";
import DialogContent from "@mui/material/DialogContent";
import { intToRoman } from "@scottobert/roman-numerals";
import IconButton from "@mui/material/IconButton";
import ViewImageDialog from "../../(masterlist)/checklists/components/view-image-dialog";
import moment from "moment";
import calculateTimeDiff from "../utils/calculateTimeDiff";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { useReactToPrint } from "react-to-print";
import { usePDF } from "react-to-pdf";
import { Document, Packer, Paragraph, ImageRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import NewPdf from "./NewPdf";
import AuroraSpinner from "../../../components/ui/aurora-spinner/aurora-spinner";

export const SurveyReport = ({
  openReport,
  setOpenReport,
}: {
  openReport: boolean;
  setOpenReport: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const getPageStyle = () => {
    const rootElement = document.documentElement;

    const computedStyle = window.getComputedStyle(rootElement);
    const primaryMainValue = computedStyle
      .getPropertyValue("--primary-main")
      .trim();

    return `

    /* WEB VIEW: Continuous scrolling */
        .photo-section-web {
          border: 2.5px solid var(--primary-main);
          border-radius: 0.5rem;
          padding: 1.5rem;
          position: relative;
          background-color: white;
        }

        /* PRINT VIEW: Individualized boxes */
        @media print {
          /* Hide the web-view's single large border and label */
          .photo-section-web {
            border: none !important;
            padding: 0 !important;
          }
          .web-label { display: none !important; top: 0.7rem !important }

          .print-page-box {
            break-after: page !important;
            page-break-after: always !important;
            border: 2.5px solid var(--primary-main) !important;
            border-radius: 0.5rem !important;
            padding: 2.5rem 1.5rem 1.5rem 1.5rem !important;
            position: relative !important;
            min-height: 92vh !important;
            margin-bottom: 0 !important;
            background-color: white !important;
          }

          /* Re-draw the "Photo Attachments" label on every printed page */
          .print-page-box::before {
            content: "Photo Attachments";
            position: absolute;
            top: -0.5rem;
            left: 1.5rem;
            width: 11rem;
            text-align: center;
            background-color: #fff9ee !important;
            color: black !important;
            border-radius: 5rem;
            font-size: 1rem;
            font-weight: bold;
            z-index: 10;
          }
        }

        @page {
          size: auto; /* auto is the initial value */
          margin-top: 10mm !important;
          margin-bottom: 0 !important; /* this affects the margin in the printer settings */
        }

        .printTitleOffset {
          @media print {
            margin-top: -5mm !important;
          }
        }

        :root {
          /* Re-define the problematic variable inside the print iframe */
          --primary-main: ${primaryMainValue};
        }
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .printContent {
          display: none;

          @media print {
            display: block !important;
          }
        }

        .printHeight {
          @media print {
            height: initial !important;
          }
        }

        .printHeightMeta {
          @media print {
            height: 75vh !important;
          }
        }

        .noOverflow {
          @media print {
            overflow: hidden !important;
          }
        }

        .printContainer {
          @media print {
            padding-top: 0 !important;
            background-color: white !important;
          }
        }

        .page-break {
          @media print {
            page-break-after: always !important;
            break-after: page !important;
            display: block;
          }
        }
      `;
  };
  const { toPDF, targetRef } = usePDF({
    filename: "survey_report.pdf",
  });
  const printStyles = getPageStyle();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    pageStyle: printStyles,
  });
  const [viewImage, setViewImage] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [fileType, setFileType] = useState<"pdf" | "docx">("pdf");
  const [downloadingFile, setDownloadingFile] = useState(false);
  const touchedData = useSelector(
    (state: RootState) => state.qaDashboard.touchedData
  );

  const [getImage] = useLazyGetImageQuery();

  const touchedChecklistData = useSelector(
    (state: RootState) => state.qaDashboard.checklistData
  );

  const { data: singleWeeklyRecord } = useGetQAQuery({
    id: touchedData?.id.toString() || "",
    week: touchedChecklistData.week.slice(0, 1),
    month: (
      new Date(`${touchedData.month.toString()} 1, 2000`).getMonth() + 1
    ).toString(),
    year: touchedData.year.toString(),
    store_checklist_id: touchedData?.store_checklist?.[0]?.id.toString() || "",
  });
  const weeklyRecord =
    singleWeeklyRecord?.data?.store_checklist?.[0]?.weekly_record?.[0];
  const goodPoints =
    weeklyRecord?.audit_trail?.[0]?.new_data?.inspection_metadata?.good_points;
  const notes =
    weeklyRecord?.audit_trail?.[0]?.new_data?.inspection_metadata?.notes;
  const dateCreated = weeklyRecord?.create_at;

  const timeIn = moment(weeklyRecord?.start_time, "HH:mm:ss").format("hh:mm A");
  const timeOut = moment(weeklyRecord?.end_time, "HH:mm:ss").format("hh:mm A");
  const startTime = moment.utc(weeklyRecord?.start_time, "HH:mm:ss");
  const endTime = moment.utc(weeklyRecord?.end_time, "HH:mm:ss");
  if (endTime.isBefore(startTime)) {
    endTime.add(1, "day");
  }
  const durationMs = endTime.diff(startTime);
  const duration = moment.duration(durationMs);
  const fullWordDifference = calculateTimeDiff(duration);
  const areaRecord =
    weeklyRecord?.audit_trail?.[0]?.new_data?.inspection_metadata?.area?.name;
  const findings =
    weeklyRecord?.audit_trail?.[0]?.new_data?.checklist_snapshot?.sections?.flatMap(
      (section) => ({
        sectionTitle: section?.title || "",
        questions: section.questions.map((question) => {
          if (question?.response?.answer != "1") {
            const findingGrade = -(
              section?.grade?.earned_points - section?.grade?.max_points
            );
            return {
              remarks: question?.response?.remarks,
              grade: findingGrade,
              attachments: question?.response?.attachment?.file_url,
            };
          } else {
            return {
              remarks: "",
              grade: -1,
              attachments: "",
            };
          }
        }),
      })
    );
  const storeDuties =
    weeklyRecord?.audit_trail?.[0]?.new_data?.inspection_metadata?.store_duties;
  const inspectorName =
    weeklyRecord?.audit_trail?.[0]?.new_data?.inspection_metadata?.inspector
      ?.full_name;

  const scoresForFindings: Array<{
    totalItems: number;
    totalPerfect: number;
    sectionNum: number;
    totalScore: number;
  }> = [];

  weeklyRecord?.audit_trail?.[0]?.new_data?.checklist_snapshot?.sections?.forEach(
    (section, sectionIndex) => {
      let totalPerfect = 0;
      let totalScore = 0;
      section.questions.forEach((question) => {
        if (question.response.answer == "1") totalPerfect++;
        totalScore = section?.grade?.earned_points || 0;
      });
      scoresForFindings.push({
        totalItems: section?.questions?.length || 0,
        totalPerfect,
        totalScore: totalScore,
        sectionNum: sectionIndex + 1,
      });
    }
  );

  const transformedFindings = findings?.flatMap((finding) => {
    return {
      sectionTitle: finding.sectionTitle,
      questions: finding.questions.filter((question) => question.grade != -1),
    };
  });

  function isEmpty(obj: Record<string, unknown>) {
    return Object.keys(obj).length === 0;
  }

  const handleClose = () => {
    contentRef.current = null;
    setOpenReport(false);
  };

  const handleChangeType = (fileType: "pdf" | "docx" | "") => {
    setFileType(fileType);
  };

  const handleDownloadDocx = async () => {
    const content = contentRef.current;
    if (!content) return;
    const docChildren: any[] = [];
    const titleEl = document.getElementById("docx-dialog-title");
    if (titleEl) {
      const titleCanvas = await html2canvas(titleEl, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#FFF", // match dialog background
        ignoreElements: (el) => el.hasAttribute("data-html2canvas-ignore"),
      });

      const titleImgDataUrl = titleCanvas.toDataURL("image/png");
      const titleBase64 = titleImgDataUrl.split(",")[1];
      const titleBinary = window.atob(titleBase64);
      const titleBuffer = new Uint8Array(titleBinary.length);

      for (let i = 0; i < titleBinary.length; i++) {
        titleBuffer[i] = titleBinary.charCodeAt(i);
      }

      const TITLE_MAX_WIDTH = 650;
      const titleWidth = TITLE_MAX_WIDTH;
      const titleHeight =
        (titleCanvas.height * TITLE_MAX_WIDTH) / titleCanvas.width;

      docChildren.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: titleBuffer,
              transformation: {
                width: titleWidth,
                height: titleHeight,
              },
              type: "png",
            } as any),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 200,
          },
        })
      );
    }
    setDownloadingFile(true);
    // 1. Capture the summary section (first page)
    const summaryEl = document.getElementById("docx-summary-section");
    if (!summaryEl) {
      setDownloadingFile(false);
      return;
    }

    // 2. Capture and add the summary section
    const summaryCanvas = await html2canvas(summaryEl, {
      useCORS: true,
      scale: 2,
      ignoreElements: (el) => el.hasAttribute("data-html2canvas-ignore"),
    });

    const summaryImgDataUrl = summaryCanvas.toDataURL("image/png");
    const summaryBase64 = summaryImgDataUrl.split(",")[1];
    const summaryBinaryString = window.atob(summaryBase64);
    const summaryImgBuffer = new Uint8Array(summaryBinaryString.length);
    for (let j = 0; j < summaryBinaryString.length; j++) {
      summaryImgBuffer[j] = summaryBinaryString.charCodeAt(j);
    }

    // Scale summary to fit A4 width
    const MAX_WIDTH = 650;
    const summaryWidth = MAX_WIDTH;
    const summaryHeight =
      (summaryCanvas.height * MAX_WIDTH) / summaryCanvas.width;

    docChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: summaryImgBuffer,
            transformation: {
              width: summaryWidth,
              height: summaryHeight,
            },
            type: "png",
          } as any),
        ],
        alignment: AlignmentType.CENTER,
      })
    );

    // 3. Get all individual images from transformedFindings
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

    // 4. Process images and fit multiple per page
    const MAX_PAGE_HEIGHT = 800; // A4 usable height in points
    const MAX_PAGE_WIDTH = 600; // A4 usable width in points
    const IMAGE_SPACING = 20; // Space between images in points

    let currentPageHeight = 0;
    let currentPageImages: any[] = [];

    for (let i = 0; i < allQuestionsWithImages.length; i++) {
      const question = allQuestionsWithImages[i];
      const imageFilename = question.attachments.split("/").pop() || "";
      const imageSrc = imageMap[imageFilename];

      if (!imageSrc) continue;

      // Create a temporary container for this single image
      const tempContainer = document.createElement("div");
      tempContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        width: 800px;
        border-radius: 0.5rem;
        padding: 20px;
        padding-top: 20px;
        background: white;
        position: relative;
        border: 2.5px solid var(--primary-main);
      `;

      const labelDiv = document.createElement("div");
      labelDiv.style.cssText = `
          position: absolute;
          top: -10px;
          left: 20px;
          background: #fff9ee;
          color: black;
          padding: 5px 20px;
          border-radius: 50px;
          font-weight: bold;
          font-size: 16px;
          z-index: 10;
        `;
      labelDiv.textContent = "Photo Attachment";

      tempContainer.innerHTML = `
        <div style="margin-bottom: 10px; ;
            border-radius: 8px;">
          <strong style="color: black; font-size: 14px;">
            ${question.sectionTitle} - Question #${question.originalIndex}
            ${question.remarks ? ": " + question.remarks : ""} - (${
        question.grade
      })
          </strong>
        </div>
        <div style="border: 5px solid var(--primary-main); text-align: center; background: #f9f9f9;">
          <img src="${imageSrc}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
        </div>
      `;

      tempContainer.appendChild(labelDiv);
      document.body.appendChild(tempContainer);
      // Capture this individual image section
      const canvas = await html2canvas(tempContainer, {
        useCORS: true,
        scale: 2,
        ignoreElements: (el) => el.hasAttribute("data-html2canvas-ignore"),
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      const imgDataUrl = canvas.toDataURL("image/png");
      const base64 = imgDataUrl.split(",")[1];
      const binaryString = window.atob(base64);
      const imgBuffer = new Uint8Array(binaryString.length);
      for (let j = 0; j < binaryString.length; j++) {
        imgBuffer[j] = binaryString.charCodeAt(j);
      }

      // Calculate dimensions for this image
      let imageWidth = MAX_PAGE_WIDTH;
      let imageHeight = (canvas.height * MAX_PAGE_WIDTH) / canvas.width;

      // Check if adding this image would exceed page height
      const wouldExceedPage =
        currentPageHeight + imageHeight + IMAGE_SPACING > MAX_PAGE_HEIGHT;

      // If this is the first image on the page and it's too tall, scale it down
      if (currentPageImages.length === 0 && imageHeight > MAX_PAGE_HEIGHT) {
        imageHeight = MAX_PAGE_HEIGHT;
        imageWidth = (canvas.width * MAX_PAGE_HEIGHT) / canvas.height;
      }

      // If adding this image would exceed the page, flush current page and start new one
      if (wouldExceedPage && currentPageImages.length > 0) {
        // Add all images from current page
        currentPageImages.forEach((imgData, idx) => {
          docChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imgData.buffer,
                  transformation: {
                    width: imgData.width,
                    height: imgData.height,
                  },
                  type: "png",
                } as any),
              ],
              pageBreakBefore: idx === 0, // Only first image on page gets page break
              alignment: AlignmentType.CENTER,
              spacing: {
                after: IMAGE_SPACING * 20, // Convert points to twips (1 point = 20 twips)
              },
            })
          );
        });

        // Reset for new page
        currentPageImages = [];
        currentPageHeight = 0;
      }

      // Add current image to the page
      currentPageImages.push({
        buffer: imgBuffer,
        width: imageWidth,
        height: imageHeight,
      });
      currentPageHeight += imageHeight + IMAGE_SPACING;

      // If this is the last image, flush the remaining images
      if (i === allQuestionsWithImages.length - 1) {
        currentPageImages.forEach((imgData, idx) => {
          docChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imgData.buffer,
                  transformation: {
                    width: imgData.width,
                    height: imgData.height,
                  },
                  type: "png",
                } as any),
              ],
              pageBreakBefore: idx === 0 && docChildren.length > 1, // Page break if not first page
              alignment: AlignmentType.CENTER,
              spacing: {
                after: IMAGE_SPACING * 20,
              },
            })
          );
        });
      }
    }

    // 5. Create and Save the document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // ~0.5 inch
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: docChildren,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Survey_Report_${moment().format("YYYY-MM-DD")}.docx`);
    setDownloadingFile(false);
  };

  useEffect(() => {
    if (!isEmpty(imageMap)) return;
    const filenames = Array.from(
      new Set(
        transformedFindings?.flatMap((f) =>
          f.questions
            .map((q) => q.attachments)
            .filter(Boolean)
            .map((fileName) => fileName.split("/").pop())
        )
      )
    );
    filenames.forEach(async (filename = "") => {
      try {
        const imageSrc = await getImage({ filename }).unwrap();
        setImageMap((prev) => ({
          ...prev,
          [filename]: imageSrc,
        }));
      } catch (err) {
        console.error("Failed to load image:", filename, err);
      }
    });
  }, [transformedFindings, imageMap]);

  return (
    <>
      <ViewImageDialog
        viewImage={viewImage}
        setViewImage={setViewImage}
        imgSrc={imgSrc}
        setImgSrc={setImgSrc}
        currentImageUrl={currentImageUrl}
      />
      <ResponsiveDialog open={openReport} onClose={handleClose}>
        {downloadingFile ? (
          <AuroraSpinner />
        ) : (
          <Box
            id="pdf-content-id"
            ref={contentRef}
            sx={{
              paddingTop: "2rem",
              backgroundColor: "#fff9ee",
              position: "relative",
            }}
            className="printContainer"
          >
            <DialogTitle id="docx-dialog-title">
              <Grid container size={12} className="printTitleOffset">
                <Grid size={6}>
                  <Typography fontWeight="regular" variant="h5">
                    {weeklyRecord?.weekly_grade}% - Report Summary
                  </Typography>
                </Grid>
                <Grid
                  container
                  justifyContent={"flex-end"}
                  spacing={2}
                  size={6}
                >
                  <Grid sx={{ displayPrint: "none" }} data-html2canvas-ignore>
                    <FormControl variant="outlined">
                      <InputLabel id="download-type-label">
                        Download Type
                      </InputLabel>
                      <Select
                        labelId="download-type-label"
                        sx={{
                          width: "170px",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "var(--primary-main)",
                            borderWidth: "2px",
                          },
                        }}
                        value={fileType || "pdf"}
                        onChange={(e) =>
                          handleChangeType(
                            e.target.value as "pdf" | "docx" | ""
                          )
                        }
                        label="Download Type"
                      >
                        <MenuItem value={"docx"}>DOCX</MenuItem>
                        <MenuItem value={"pdf"}>PDF</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid sx={{ displayPrint: "none" }} data-html2canvas-ignore>
                    <Button variant="contained">
                      <IconButton
                        onClick={
                          fileType === "pdf"
                            ? async () => {
                                const originalColor =
                                  targetRef.current?.style.backgroundColor;
                                targetRef.current.style.backgroundColor =
                                  "white";
                                setTimeout(() => {}, 500);
                                setDownloadingFile(true);
                                toPDF();
                                setDownloadingFile(false);
                                targetRef.current.style.backgroundColor =
                                  originalColor;
                              }
                            : () => {
                                const originalColor =
                                  targetRef.current?.style.backgroundColor;
                                targetRef.current.style.backgroundColor =
                                  "white";
                                setTimeout(() => {}, 500);
                                handleDownloadDocx();
                                targetRef.current.style.backgroundColor =
                                  originalColor;
                              }
                        }
                      >
                        <DownloadSimple fill="white" />
                      </IconButton>
                    </Button>
                  </Grid>
                  <Grid sx={{ displayPrint: "none" }} data-html2canvas-ignore>
                    <Button
                      variant="contained"
                      startIcon={<Printer />}
                      sx={{ height: "52px" }}
                      onClick={reactToPrintFn}
                    >
                      PRINT
                    </Button>
                  </Grid>
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
              <Box id="docx-summary-section">
                <Grid
                  container
                  sx={{ paddingY: "1rem", overflowY: "auto" }}
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
                                        {questionIndex + 1}. {question?.remarks}{" "}
                                        ( -{question?.grade.toFixed(2)}){" "}
                                        {question?.attachments && (
                                          <IconButton
                                            data-html2canvas-ignore
                                            sx={{
                                              backgroundColor:
                                                "var(--primary-light)",
                                              height: "35px",
                                              display: "inline-flex",
                                              justifyContent: "center",
                                              alignItems: "center",
                                              marginY: "0.3rem",
                                              displayPrint: "none",
                                            }}
                                            onClick={() => {
                                              setCurrentImageUrl(
                                                question.attachments
                                                  .split("/")
                                                  .pop() || ""
                                              );
                                              setViewImage(true);
                                              setImgSrc(
                                                imageMap[
                                                  question.attachments
                                                    .split("/")
                                                    .pop() || ""
                                                ]
                                              );
                                            }}
                                          >
                                            <FileImage width={"20px"} />
                                          </IconButton>
                                        )}
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

                    <Grid
                      container
                      spacing={2}
                      size={12}
                      sx={{ marginTop: "1rem" }}
                    >
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
                              {scoresForFindings.map(
                                (findingScore, scoreIndex) => (
                                  <>
                                    <Grid size={6}>
                                      <Typography
                                        key={scoreIndex}
                                        color="black"
                                      >
                                        {intToRoman(findingScore.sectionNum)} -{" "}
                                        {findingScore.totalPerfect}/
                                        {findingScore.totalItems}
                                      </Typography>
                                    </Grid>
                                    <Grid size={6} textAlign={"right"}>
                                      <Typography
                                        key={scoreIndex}
                                        color="black"
                                      >
                                        {findingScore.totalScore}
                                      </Typography>
                                    </Grid>
                                  </>
                                )
                              )}
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
                      <Typography color="white">
                        Time out: {timeOut}{" "}
                      </Typography>
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
                      <Typography color="white">
                        {fullWordDifference}
                      </Typography>
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
              </Box>
              <Box sx={{ breakBefore: "page" }}></Box>
              <Grid container size={12}>
                <Grid
                  size={12}
                  className="photo-section-web"
                  sx={{
                    position: "relative",
                    backgroundColor: "white",
                    border: "2.5px solid var(--primary-main)",
                    width: "100%",
                    borderRadius: "0.5rem",
                    zIndex: "0",
                    padding: "1.1rem",
                  }}
                >
                  {/* WEB ONLY LABEL */}
                  <Typography
                    className="web-label"
                    sx={{
                      color: "black",
                      width: "11rem",
                      textAlign: "center",
                      backgroundColor: "#fff9ee",
                      borderRadius: "5rem",
                      position: "absolute",
                      top: "-0.7rem",
                      left: "0.7rem",
                      zIndex: 2,
                    }}
                  >
                    Photo Attachments
                  </Typography>

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
                      return (
                        <Alert severity="error">No Photo Attachments</Alert>
                      );
                    }

                    return pairs.map((pair, pairIndex) => (
                      <>
                        <Box height="35px" width="100%" />
                        <Box
                          key={pairIndex}
                          className="print-page-box"
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
                                sx={{
                                  fontWeight: "bold",
                                  mb: 1,
                                  color: "black",
                                }}
                              >
                                {question.sectionTitle} - Question #
                                {question.originalIndex}{" "}
                                {question.remarks
                                  ? ": " + question.remarks
                                  : ""}{" "}
                                - ({question.grade})
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
                                      question.attachments.split("/").pop() ||
                                        ""
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
                      </>
                    ));
                  })()}
                </Grid>
              </Grid>
            </DialogContent>
          </Box>
        )}
      </ResponsiveDialog>
      <NewPdf
        imageMap={imageMap}
        targetRef={targetRef}
        transformedFindings={transformedFindings}
        weeklyRecord={weeklyRecord}
        goodPoints={goodPoints}
        scoresForFindings={scoresForFindings}
        dateCreated={dateCreated || ""}
        timeIn={timeIn}
        timeOut={timeOut}
        notes={notes}
        areaRecord={areaRecord}
        storeDuties={storeDuties}
        inspectorName={inspectorName}
        fullWordDifference={fullWordDifference}
      />
    </>
  );
};
