import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useSnackbar } from "notistack";
import { ResponsiveDialog } from "../../../components/ui/responsive-dialog";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ApiError } from "../../../features/api/aurora/types/types";
import {
  useForApprovalMutation,
  useGetQAQuery,
} from "../../../features/api/aurora/qa-dashboard.api";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";

type ForApproveTrigger = ReturnType<typeof useForApprovalMutation>[0];

const ForApprovalDialog = ({
  isForApprovalOpen,
  setIsForApprovalOpen,
  forApprove,
  isLoading,
}: {
  isForApprovalOpen: { open: boolean; id: string };
  setIsForApprovalOpen: React.Dispatch<
    React.SetStateAction<{ open: boolean; id: string }>
  >;
  forApprove: ForApproveTrigger;
  isLoading: boolean;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const touchedChecklistData = useSelector(
    (state: RootState) => state.qaDashboard.checklistData,
  );
  const touchedData = useSelector(
    (state: RootState) => state.qaDashboard.touchedData,
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
    { skip: !touchedChecklistData.isForApproving },
  );
  const weeklyRecordId =
    singleWeeklyRecord?.data?.store_checklist?.[0]?.weekly_record?.[0]?.id;
  useEffect(() => {
    if (reason) {
      setReason("");
    }
  }, []);

  const handleFormSubmit = async () => {
    try {
      if (!reason) {
        setError("Remarks is required");
        return;
      } else {
        setError("");
      }
      setError("");
      const response = await forApprove({
        id: Number(weeklyRecordId) || -1,
        body: { reason: reason ?? "" },
      }).unwrap();
      enqueueSnackbar(response?.message, {
        variant: "success",
      });
      setIsForApprovalOpen({ open: false, id: "" });
      setReason("");
    } catch (error) {
      const apiError = error as {
        status: number;
        data: { errors: Array<ApiError> };
      };
      apiError.data.errors.forEach((error) => {
        enqueueSnackbar(error.detail, {
          variant: "error",
        });
      });
      setReason("");
    }
  };

  return (
    <ResponsiveDialog
      open={isForApprovalOpen.open}
      onClose={() => {
        setIsForApprovalOpen({ open: false, id: "" });
      }}
      disableClickAway={true}
      maxHeight="350px">
      <DialogTitle>Survey Approval</DialogTitle>
      <DialogContent>
        <Typography>Enter a valid reason</Typography>
        <TextField
          multiline
          rows={4}
          fullWidth
          label="Reason"
          sx={{ marginY: "15px" }}
          onChange={(e) => {
            setError("");
            setReason(e.target.value);
          }}
          error={!!error}
          value={reason}
        />
        {error && <Typography color="error">{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          loading={isLoading}
          loadingPosition="start"
          onClick={handleFormSubmit}>
          Submit
        </Button>
        <Button
          loading={isLoading}
          loadingPosition="start"
          onClick={() => {
            setIsForApprovalOpen({ open: false, id: "" });
            setReason("");
          }}>
          Close
        </Button>
      </DialogActions>
    </ResponsiveDialog>
  );
};

export default ForApprovalDialog;
