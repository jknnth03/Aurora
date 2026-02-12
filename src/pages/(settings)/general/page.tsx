import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { Gear, PencilSimple } from "@phosphor-icons/react";
import AuroraSpinner from "../../../components/ui/aurora-spinner/aurora-spinner";
import {
  useGetGradingsQuery,
  useUpdateGradingMutation,
} from "../../../features/api/aurora/masterlist/grading.api";
import {
  useGetAllowableDaysQuery,
  useUpdateAllowableDaysMutation,
} from "../../../features/api/aurora/masterlist/allowable.api";

const General = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [capPercentage, setCapPercentage] = useState("");
  const [gradingId, setGradingId] = useState(null);
  const [originalCapPercentage, setOriginalCapPercentage] = useState("");
  const [isEditingGrading, setIsEditingGrading] = useState(false);

  const [allowableDays, setAllowableDays] = useState("");
  const [allowableDaysId, setAllowableDaysId] = useState(null);
  const [originalAllowableDays, setOriginalAllowableDays] = useState("");
  const [isEditingAllowable, setIsEditingAllowable] = useState(false);

  const {
    data: gradingsData,
    isLoading: isLoadingGrading,
    isError: isErrorGrading,
    refetch: refetchGrading,
  } = useGetGradingsQuery({
    status: "active",
  });

  const {
    data: allowableDaysData,
    isLoading: isLoadingAllowable,
    isError: isErrorAllowable,
    refetch: refetchAllowable,
  } = useGetAllowableDaysQuery();

  const [updateGrading, { isLoading: isUpdatingGrading }] =
    useUpdateGradingMutation();
  const [updateAllowableDays, { isLoading: isUpdatingAllowable }] =
    useUpdateAllowableDaysMutation();

  useEffect(() => {
    if (gradingsData?.data && Array.isArray(gradingsData.data)) {
      const grading = gradingsData.data[0];
      if (grading) {
        const value = Number(grading.cap_percentage) || "";
        setCapPercentage(value);
        setOriginalCapPercentage(value);
        setGradingId(grading.id);
      }
    }
  }, [gradingsData]);

  useEffect(() => {
    if (allowableDaysData?.data) {
      const allowable = allowableDaysData.data;
      const value = Number(allowable.allowable_days) || "";
      setAllowableDays(value);
      setOriginalAllowableDays(value);
      setAllowableDaysId(allowable.id);
    }
  }, [allowableDaysData]);

  useEffect(() => {
    if (isErrorGrading) {
      enqueueSnackbar({
        variant: "error",
        message: "Failed to load grading data.",
      });
    }
  }, [isErrorGrading, enqueueSnackbar]);

  useEffect(() => {
    if (isErrorAllowable) {
      enqueueSnackbar({
        variant: "error",
        message: "Failed to load allowable days data.",
      });
    }
  }, [isErrorAllowable, enqueueSnackbar]);

  const hasGradingChanges = capPercentage !== originalCapPercentage;
  const hasAllowableChanges = allowableDays !== originalAllowableDays;

  const handleSaveGrading = async () => {
    try {
      if (capPercentage === "") {
        enqueueSnackbar({
          variant: "warning",
          message: "Please fill in the cap percentage field.",
        });
        return;
      }

      if (!gradingId) {
        enqueueSnackbar({
          variant: "error",
          message: "Grading configuration not loaded.",
        });
        return;
      }

      if (!hasGradingChanges) {
        enqueueSnackbar({
          variant: "info",
          message: "No changes to save.",
        });
        return;
      }

      await updateGrading({
        id: gradingId,
        body: {
          cap_percentage: Number(capPercentage),
        },
      }).unwrap();

      enqueueSnackbar({
        variant: "success",
        message: "Grading updated successfully!",
      });

      setOriginalCapPercentage(capPercentage);
      setIsEditingGrading(false);
      refetchGrading();
    } catch (error) {
      console.error("Save Grading Error:", error);
      enqueueSnackbar({
        variant: "error",
        message: error?.data?.message || "Failed to update grading.",
      });
    }
  };

  const handleSaveAllowableDays = async () => {
    try {
      if (allowableDays === "") {
        enqueueSnackbar({
          variant: "warning",
          message: "Please fill in the allowable days field.",
        });
        return;
      }

      if (!allowableDaysId) {
        enqueueSnackbar({
          variant: "error",
          message: "Allowable days configuration not loaded.",
        });
        return;
      }

      if (!hasAllowableChanges) {
        enqueueSnackbar({
          variant: "info",
          message: "No changes to save.",
        });
        return;
      }

      await updateAllowableDays({
        id: allowableDaysId,
        body: {
          days: Number(allowableDays),
        },
      }).unwrap();

      enqueueSnackbar({
        variant: "success",
        message: "Allowable days updated successfully!",
      });

      setOriginalAllowableDays(allowableDays);
      setIsEditingAllowable(false);
      refetchAllowable();
    } catch (error) {
      console.error("Save Allowable Days Error:", error);
      enqueueSnackbar({
        variant: "error",
        message: error?.data?.message || "Failed to update allowable days.",
      });
    }
  };

  const handleCancelGrading = () => {
    setCapPercentage(originalCapPercentage);
    setIsEditingGrading(false);
  };

  const handleCancelAllowable = () => {
    setAllowableDays(originalAllowableDays);
    setIsEditingAllowable(false);
  };

  if (isLoadingGrading || isLoadingAllowable) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <AuroraSpinner />
      </Box>
    );
  }

  if (isErrorGrading && isErrorAllowable) {
    return (
      <Box sx={{ width: "100%", height: "100%", overflowY: "auto", p: 3 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: "error.lighter",
          }}>
          <Typography variant="h6" color="error" gutterBottom>
            Failed to Load Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Unable to fetch configuration data. Please try again.
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              refetchGrading();
              refetchAllowable();
            }}>
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%", overflowY: "auto" }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
          <Gear size={24} color="var(--primary-main)" />
          <Typography variant="h5" fontWeight={600}>
            System Settings
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Configure system settings based on defined processes and policies.
        </Typography>

        <Paper variant="outlined" sx={{ mb: 3, p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="text.secondary">
              Grading
            </Typography>
            <Tooltip title="Edit grading settings" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={() => setIsEditingGrading(true)}
                  disabled={isEditingGrading || !gradingId}
                  sx={{ ml: "auto" }}>
                  <PencilSimple size={18} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <TextField
            fullWidth
            label="Cap Percentage"
            type="number"
            value={capPercentage}
            onChange={(e) => {
              const value = e.target.value;
              setCapPercentage(value === "" ? "" : Number(value));
            }}
            inputProps={{
              min: 0,
              max: 100,
              step: 0.01,
            }}
            placeholder="Enter cap percentage"
            helperText="Set the cap percentage for grading calculation"
            disabled={!isEditingGrading || isUpdatingGrading || !gradingId}
          />
          {isEditingGrading && (
            <Box
              sx={{
                mt: 1,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 1,
              }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancelGrading}
                disabled={isUpdatingGrading}
                sx={{
                  textTransform: "none",
                  px: 3,
                  borderRadius: 2,
                }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleSaveGrading}
                disabled={isUpdatingGrading || !hasGradingChanges}
                sx={{
                  textTransform: "none",
                  px: 3,
                  borderRadius: 2,
                }}>
                {isUpdatingGrading ? "Saving..." : "Save"}
              </Button>
            </Box>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ mb: 3, p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="text.secondary">
              Allowable Days
            </Typography>
            <Tooltip title="Edit allowable days settings" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={() => setIsEditingAllowable(true)}
                  disabled={isEditingAllowable || !allowableDaysId}
                  sx={{ ml: "auto" }}>
                  <PencilSimple size={18} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <TextField
            fullWidth
            label="Allowable Days"
            type="number"
            value={allowableDays}
            onChange={(e) => {
              const value = e.target.value;
              setAllowableDays(value === "" ? "" : Number(value));
            }}
            inputProps={{
              min: 0,
              step: 1,
            }}
            placeholder="Enter cutoff days"
            helperText="Set the number of days allowed before the checklist becomes overdue."
            disabled={
              !isEditingAllowable || isUpdatingAllowable || !allowableDaysId
            }
          />
          {isEditingAllowable && (
            <Box
              sx={{
                mt: 1,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 1,
              }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancelAllowable}
                disabled={isUpdatingAllowable}
                sx={{
                  textTransform: "none",
                  px: 3,
                  borderRadius: 2,
                }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleSaveAllowableDays}
                disabled={isUpdatingAllowable || !hasAllowableChanges}
                sx={{
                  textTransform: "none",
                  px: 3,
                  borderRadius: 2,
                }}>
                {isUpdatingAllowable ? "Saving..." : "Save"}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default General;
