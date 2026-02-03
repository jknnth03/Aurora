import { ResponsiveDialog } from "../../../components/ui/responsive-dialog";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { enqueueSnackbar } from "notistack";
import { useRejectSurveyMutation } from "../../../features/api/aurora/survey-approver.api";
import { ApiError } from "../../../features/api/aurora/types/types";
type RejectSurveyTrigger = ReturnType<typeof useRejectSurveyMutation>[0];
export const RejectConfirmationDialog = ({
  reject,
  isRejectConfirmDialogOpen,
  setIsRejectConfirmDialogOpen,
  setIsForSurveyApprovalOpen,
  remarks,
  setRemarks,
  weeklyID,
}: {
  reject: RejectSurveyTrigger;
  isRejectConfirmDialogOpen: boolean;
  setIsRejectConfirmDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsForSurveyApprovalOpen: React.Dispatch<
    React.SetStateAction<{ open: boolean; id: string }>
  >;
  remarks: string;
  setRemarks: React.Dispatch<React.SetStateAction<string>>;
  weeklyID?: number;
}) => {
  const handleRejectSubmit = async () => {
    try {
      setIsRejectConfirmDialogOpen(false);
      setIsForSurveyApprovalOpen({ open: false, id: "" });
      const response = await reject({
        id: Number(weeklyID),
        remarks,
      }).unwrap();
      setRemarks("");
      enqueueSnackbar(response.message, { variant: "success" });
    } catch (error) {
      const apiError = error as ApiError;
      enqueueSnackbar(apiError.detail, { variant: "error" });
    }
  };

  return (
    <ResponsiveDialog
      open={isRejectConfirmDialogOpen}
      onClose={() => {
        setRemarks("");
        setIsRejectConfirmDialogOpen(false);
      }}
      disableClickAway={true}
      maxHeight="350px"
    >
      <DialogTitle>Survey Approval Request</DialogTitle>
      <DialogContent>
        <Typography>Reject Approver Remarks</Typography>
        <TextField
          multiline
          rows={4}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          fullWidth
          sx={{ marginY: "15px" }}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => handleRejectSubmit()}>
          Confirm
        </Button>
        <Button
          onClick={() => {
            setRemarks("");
            setIsRejectConfirmDialogOpen(false);
          }}
        >
          Close
        </Button>
      </DialogActions>
    </ResponsiveDialog>
  );
};
