import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import moment from "moment";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";
import Aurora from "../../assets/aurora.svg?react";
import PageLoad from "../../components/layout/__loading/__loading";
import { MarkdownViewer } from "../../components/ui/markdown/markdown-viewer";
import { CONFIG } from "../../config/config";
import {
  IPatchNotesResponse,
  useGetPatchNoteFileQuery,
  useGetPatchNotesPublicUnpaginatedQuery,
  useGetPatchNotesUnpaginatedQuery,
} from "../../features/api/aurora/masterlist/patch-notes.api";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import TableOfContentsSidebar, {
  extractTableOfContents,
} from "./components/table-of-contents";
import TypeChip from "./components/type-chip";
import { useHeaderMapping } from "./hooks/useHeaderMapping";
import { isWithinBuffer } from "./utils/isWithinBuffer";

const paramName = "version";

const Patch: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));
  const location = useLocation();
  const prevLoc = location.state?.prevLoc ?? null;

  console.log(`👻 ~ prevLoc:`, prevLoc);

  // Use useState for both unpublished state and patch notes
  const [unpublishState, setUnpublishState] = useState<boolean>(
    location?.state?.unpublished ?? false
  );
  const [patchNotes, setPatchNotes] = useState<IPatchNotesResponse[]>([]);
  const showPublished = !unpublishState;

  const {
    data: publicData,
    isLoading: isPublicDataLoading,
    isFetching: isPublicDataFetching,
    isError: isPublicDataError,
    isSuccess: isPublicDataSuccess,
  } = useGetPatchNotesPublicUnpaginatedQuery(
    {
      status: "published",
    },
    {
      skip: unpublishState,
    }
  );
  const {
    data: privateData,
    isLoading: isPrivateDataLoading,
    isFetching: isPrivateDataFetching,
    isError: isPrivateDataError,
    isSuccess: isPrivateDataSuccess,
  } = useGetPatchNotesUnpaginatedQuery(
    {
      status: "unpublished",
    },
    {
      skip: !unpublishState,
    }
  );

  const { currentParams, setQueryParams } = useRememberQueryParams();

  // Get selected patch ID from query params
  const selectedPatchId = currentParams[paramName]
    ? currentParams[paramName]
    : null;
  const [selectedPatch, setSelectedPatch] =
    useState<IPatchNotesResponse | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(!isMobile);

  // Ref for the content container
  const contentRef = useRef<HTMLDivElement | null>(
    null
  ) as React.RefObject<HTMLDivElement>;

  // Update patchNotes when data changes or unpublish state changes
  useEffect(() => {
    if (!unpublishState && isPublicDataSuccess && publicData?.data) {
      setPatchNotes(publicData.data);
    } else if (unpublishState && isPrivateDataSuccess && privateData?.data) {
      setPatchNotes(privateData.data);
    } else {
      setPatchNotes([]);
    }
  }, [
    unpublishState,
    publicData?.data,
    privateData?.data,
    isPublicDataSuccess,
    isPrivateDataSuccess,
  ]);

  // Auto-select first patch when data loads and no patch is selected
  useEffect(() => {
    if (patchNotes.length > 0 && !selectedPatchId) {
      setQueryParams({ [paramName]: patchNotes[0].version }, { retain: true });
    }
  }, [patchNotes, selectedPatchId, setQueryParams]);

  // Update selected patch when ID changes
  useEffect(() => {
    if (selectedPatchId && patchNotes.length > 0) {
      const patch = patchNotes.find(
        (p: IPatchNotesResponse) => p.version === selectedPatchId
      );
      const filePath = patch?.filepath;
      const fileName = filePath?.split("/").pop();
      setSelectedPatch(patch || null);
      setSelectedPath(fileName || null);
    }
  }, [selectedPatchId, patchNotes]);

  const {
    data: file,
    isLoading: isFileLoading,
    isFetching: isFileFetching,
    isError: isFileError,
  } = useGetPatchNoteFileQuery(selectedPath ?? "", {
    skip: !selectedPath || !selectedPatch,
  });

  // Extract TOC from markdown content (without modifying the content)
  const tableOfContentsItems = useMemo(
    () => extractTableOfContents(file || ""),
    [file]
  );

  // Map TOC items to actual DOM elements
  const isContentReady = !!(file && !isFileLoading && !isFileFetching);
  const mappedHeaders = useHeaderMapping(
    contentRef,
    tableOfContentsItems,
    isContentReady
  );

  const handlePatchChange = (event: SelectChangeEvent<number>): void => {
    setQueryParams(
      { [paramName]: event.target.value as number },
      { retain: true }
    );
  };

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Close sidebar on mobile when patch changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [selectedPatchId, isMobile]);

  // Responsive values
  const getResponsiveValues = () => ({
    headerPadding: isMobile ? 3 : 4,
    contentPadding: isMobile ? 4 : isLarge ? 18 : 4,
    cardPadding: isMobile ? 3 : 4,
    logoSize: isMobile ? 35 : 50,
    selectMinWidth: isMobile ? "100%" : 300,
  });

  const handleShowPublishedChange = () => {
    const newUnpublishState = !unpublishState;
    setUnpublishState(newUnpublishState);

    // Navigate with empty search to reset version param
    navigate(
      {
        pathname: location.pathname,
        search: "",
      },
      {
        state: {
          // Handle the case where location.state is null
          ...(location.state || {}),
          unpublished: newUnpublishState,
        },
        replace: true,
      }
    );
  };

  const responsive = getResponsiveValues();

  if (
    isPublicDataLoading ||
    isPrivateDataLoading ||
    isPublicDataFetching ||
    isPrivateDataFetching
  ) {
    return <PageLoad />;
  }

  if (isPublicDataError || isPrivateDataError) {
    return (
      <Box height="100vh" p={responsive.headerPadding}>
        <Alert severity="error">
          Failed to load patch notes. Please try again.
        </Alert>
      </Box>
    );
  }

  if (patchNotes?.length === 0) {
    return (
      <Box height="100vh" p={responsive.headerPadding}>
        <Alert severity="info">No patch notes available.</Alert>
      </Box>
    );
  }

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      sx={{
        overflow: "hidden",
      }}
    >
      <Box height="100%" width="100%" overflow="auto">
        {/* Header with Patch Selector */}
        <Box p={responsive.headerPadding}>
          <Box
            display="flex"
            alignItems={isMobile ? "flex-start" : "center"}
            justifyContent="space-between"
            gap={2}
            flexDirection={isMobile ? "column" : "row"}
          >
            {/* Title and Selector Section */}
            <Box
              display="flex"
              alignItems={isMobile ? "flex-start" : "center"}
              gap={isMobile ? 2 : 4}
              flexDirection={isMobile ? "column" : "row"}
              width={isMobile ? "100%" : "auto"}
            >
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                width={isMobile ? "100%" : undefined}
              >
                <Typography
                  variant={"h4"}
                  gutterBottom={isMobile}
                  sx={{
                    mb: isMobile ? 0 : undefined,
                    whiteSpace: "nowrap",
                  }}
                >
                  Patch Notes
                </Typography>
                {isMobile && (
                  <Box
                    display="flex"
                    gap={2}
                    component={Link}
                    href="/"
                    alignItems="center"
                    sx={{
                      textDecoration: "none",
                    }}
                  >
                    <Box>
                      <Aurora
                        height={responsive.logoSize}
                        width={responsive.logoSize}
                        color="var(--primary-main)"
                      />
                    </Box>
                    <Typography
                      variant={"h3"}
                      fontWeight="bold"
                      component="div"
                      className="sidebar__title"
                    >
                      {CONFIG.APP_NAME}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box display={"flex"} gap={4}>
                <FormControl sx={{ minWidth: "150px" }}>
                  <InputLabel id="patch-select-label">Select Patch</InputLabel>
                  <Select
                    labelId="patch-select-label"
                    size={"small"}
                    value={Number(selectedPatchId) || ""}
                    label="Select Patch"
                    onChange={handlePatchChange}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: isMobile ? 300 : 400,
                        },
                      },
                    }}
                  >
                    {patchNotes.map((patch) => {
                      return (
                        <MenuItem key={patch.version} value={patch.version}>
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            width="100%"
                            gap={1}
                            flexDirection={"row"}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                flex: 1,
                                fontSize: isMobile ? "0.875rem" : "1rem",
                              }}
                            >
                              v{patch.version} - {patch.title}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <TypeChip type={patch.type} />
                            </Box>
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                {/* {location?.state !== null && (
									<FormControlLabel
										control={
											<Checkbox
												checked={showPublished}
												onChange={handleShowPublishedChange}
												color="primary"
											/>
										}
										label="Published"
									/>
								)} */}
              </Box>
            </Box>

            {/* Logo and App Name Section */}
            {!isMobile && (
              <Box
                display="flex"
                gap={2}
                component={Link}
                href="/"
                alignItems="center"
                sx={{
                  textDecoration: "none",
                }}
              >
                <Box>
                  <Aurora
                    height={responsive.logoSize}
                    width={responsive.logoSize}
                    color="var(--primary-main)"
                  />
                </Box>
                <Typography
                  variant={"h3"}
                  fontWeight="bold"
                  component="div"
                  className="sidebar__title"
                >
                  {CONFIG.APP_NAME}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Content Section */}
        <Box px={responsive.contentPadding}>
          {selectedPatch && (
            <>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                flexWrap="wrap"
                mb={2}
              >
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  fontWeight="bold"
                  color="primary"
                  sx={{
                    wordBreak: "break-word",
                    hyphens: "auto",
                  }}
                >
                  v{selectedPatch.version} - {selectedPatch.title}
                </Typography>
                <TypeChip type={selectedPatch.type} />
                {(() => {
                  const isRecent = isWithinBuffer(
                    selectedPatch.published_at,
                    CONFIG.PATCH_BUFFER_LEVEL
                  );
                  const isLatest = patchNotes.at(0)?.id === selectedPatch.id;

                  const baseChipStyles = {
                    fontWeight: 600,
                    "& .MuiChip-label": {
                      fontSize: isMobile ? "0.65rem" : "0.7rem",
                    },
                    transition: "all 0.2s ease-in-out",
                  };

                  if (!isRecent) return null;

                  if (unpublishState)
                    return (
                      <Chip
                        label="Unpublished"
                        size="small"
                        variant="filled"
                        sx={{
                          ...baseChipStyles,
                          backgroundColor: "var(--warning-main)",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "var(--warning-light)",
                          },
                        }}
                      />
                    );

                  return isLatest ? (
                    <Chip
                      label="Latest"
                      size="small"
                      variant="filled"
                      sx={{
                        ...baseChipStyles,
                        backgroundColor: "var(--success-main)",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "var(--success-light)",
                        },
                      }}
                    />
                  ) : (
                    <Chip
                      label="Recent"
                      size="small"
                      variant="outlined"
                      sx={{
                        ...baseChipStyles,
                        color: "var(--success-main)",
                        borderColor: "var(--success-main)",
                        "&:hover": {
                          backgroundColor: "#10B98115",
                          borderColor: "var(--success-light)",
                          color: "var(--success-light)",
                        },
                      }}
                    />
                  );
                })()}
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: isMobile ? "0.7rem" : "0.75rem",
                  display: "block",
                  wordBreak: "break-word",
                  mb: 2,
                }}
              >
                Created:{" "}
                {moment(selectedPatch?.created_at).format(
                  CONFIG.DATE_FORMAT_DISPLAY
                )}
                {selectedPatch?.published_at && (
                  <>
                    {isMobile ? <br /> : " | "}
                    Published:{" "}
                    {moment(selectedPatch.published_at).format(
                      CONFIG.DATE_FORMAT_DISPLAY
                    )}
                  </>
                )}
              </Typography>
              <Box mb={2}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: isMobile ? "0.8rem" : "0.875rem",
                    lineHeight: isMobile ? 1.4 : 1.5,
                  }}
                >
                  {selectedPatch.description}
                </Typography>
              </Box>
            </>
          )}
          <Divider sx={{ mb: 2 }} />

          {/* Table of Contents Sidebar (Mobile) */}
          {isMobile && (
            <TableOfContentsSidebar
              headers={mappedHeaders}
              isOpen={sidebarOpen}
              onToggle={handleSidebarToggle}
              isMobile={true}
            />
          )}

          {/* Content Area with Sidebar Layout */}
          <Box
            display="flex"
            gap={isMobile ? 0 : 3}
            sx={{
              flexDirection: isMobile ? "column" : "row",
              alignItems: "flex-start",
            }}
          >
            {/* Sidebar for desktop/tablet */}
            {!isMobile && (
              <TableOfContentsSidebar
                headers={mappedHeaders}
                isOpen={sidebarOpen}
                onToggle={handleSidebarToggle}
                isMobile={false}
              />
            )}

            {/* Main Content */}
            <Card
              variant="outlined"
              sx={{
                backgroundColor: "transparent",
                mb: responsive.contentPadding,
                padding: responsive.cardPadding,
                flex: 1,
                minWidth: 0,
              }}
            >
              <Box sx={{ height: "100%" }}>
                {(isFileLoading || isFileFetching) && !isPublicDataLoading ? (
                  <Grid
                    container
                    flex={1}
                    display="flex"
                    spacing={isMobile ? 1 : 2}
                  >
                    <Grid size={12}>
                      <Skeleton width="40%" height={isMobile ? 24 : 32} />
                    </Grid>
                    <Grid size={12}>
                      {[...Array(6)].map((_, index) => (
                        <Skeleton
                          key={index}
                          width="100%"
                          height={isMobile ? 16 : 20}
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                    </Grid>
                  </Grid>
                ) : isFileError ? (
                  <Box flex={1} p={responsive.cardPadding}>
                    <Alert severity="error">Failed to load patch content</Alert>
                  </Box>
                ) : (
                  <Box
                    ref={contentRef}
                    flex={1}
                    sx={{
                      overflow: "auto",
                      "& .markdown-viewer": {
                        fontSize: isMobile ? "0.875rem" : "1rem",
                        lineHeight: isMobile ? 1.5 : 1.6,
                        "& h1, & h2, & h3, & h4, & h5, & h6": {
                          marginTop: isMobile ? "1rem" : "1.5rem",
                          marginBottom: isMobile ? "0.5rem" : "0.75rem",
                          scrollMarginTop: "100px", // Account for any sticky elements
                        },
                        "& p": {
                          marginBottom: isMobile ? "0.75rem" : "1rem",
                        },
                        "& ul, & ol": {
                          paddingLeft: isMobile ? "1rem" : "1.5rem",
                        },
                        "& pre": {
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                          padding: isMobile ? "0.5rem" : "1rem",
                          overflow: "auto",
                        },
                        "& code": {
                          fontSize: isMobile ? "0.8em" : "0.875em",
                        },
                        "& table": {
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                          "& th, & td": {
                            padding: isMobile ? "0.25rem" : "0.5rem",
                          },
                        },
                        "& img": {
                          maxWidth: "100%",
                          height: "auto",
                        },
                      },
                    }}
                  >
                    {file && (
                      <MarkdownViewer src={{ type: "text", content: file }} />
                    )}
                  </Box>
                )}
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Patch;
