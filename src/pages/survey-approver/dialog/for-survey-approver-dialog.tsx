import { useOpenApproval } from "../../../hooks/useOpenApproval";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { RootState } from "../../../app/store";
import { enqueueSnackbar } from "notistack";
import { ApiError } from "../../../features/api/aurora/types/types";
import { useGetQAQuery } from "../../../features/api/aurora/qa-dashboard.api";
import AuroraSpinner from "../../../components/ui/aurora-spinner/aurora-spinner";
import { useSelector } from "react-redux";
import { MODULES } from "../../../config/modules/modules";
import { ResponsiveDialog } from "../../../components/ui/responsive-dialog";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { RejectConfirmationDialog } from "./reject-confirmation-dialog";
import { set } from "zod";
import { useState } from "react";

import {
  useApproveSurveyMutation,
  useRejectSurveyMutation,
} from "../../../features/api/aurora/survey-approver.api";
import { useOpenChecklist } from "../../../hooks/useOpenChecklist";
import { useFetchFile } from "../../(masterlist)/patch-notes/hooks/useFetchFile";

type ForApproveSurveyTrigger = ReturnType<typeof useApproveSurveyMutation>[0];

export const ForSurveyApproverDialog = ({
  isLoadingApprove,
  approve,
  isForSurveyApprovalOpen,
  setIsForSurveyApprovalOpen,
}: {
  isLoadingApprove: boolean;
  approve: ForApproveSurveyTrigger;
  isForSurveyApprovalOpen: { open: boolean; id: string };
  setIsForSurveyApprovalOpen: React.Dispatch<
    React.SetStateAction<{ open: boolean; id: string }>
  >;
}) => {
  const { isOpen: isQAItemOpen, close: closeQADialog } = useOpenChecklist();
  const touchedChecklistData = useSelector(
    (state: RootState) => state.qaDashboard.checklistData
  );
  const touchedData = useSelector(
    (state: RootState) => state.qaDashboard.touchedData
  );
  const [remarks, setRemarks] = useState("");
  const [isRejectConfirmDialogOpen, setIsRejectConfirmDialogOpen] =
    useState(false);
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
      refetchOnMountOrArgChange: true,
      skip: !touchedChecklistData.isForApproving,
    }
  );

  const [reject, { isLoading: isLoadingReject }] = useRejectSurveyMutation();
  const selectedWeekReason =
    singleWeeklyRecord?.data?.store_checklist?.[0]?.weekly_record?.[0]
      ?.for_approval_reason;
  const weeklyID =
    singleWeeklyRecord?.data?.store_checklist?.[0]?.weekly_record?.[0]?.id;
  const reason = JSON.parse(selectedWeekReason || "{}").reason;

  const handleApprove = async () => {
    try {
      setIsForSurveyApprovalOpen({ open: false, id: "" });
      const response = await approve({
        id: Number(weeklyID),
      }).unwrap();
      enqueueSnackbar(response.message, { variant: "success" });
    } catch (error) {
      const apiError = error as ApiError;
      enqueueSnackbar(apiError.detail, { variant: "error" });
    }
  };
  const handleReject = async () => {
    setIsRejectConfirmDialogOpen(true);
  };

  return (
    <>
      <ResponsiveDialog
        open={isForSurveyApprovalOpen.open}
        onClose={() => {
          setIsForSurveyApprovalOpen({ open: false, id: "" });
        }}
        disableClickAway={true}
        maxHeight="350px"
      >
        <DialogTitle>Survey Approval Request</DialogTitle>
        <DialogContent>
          {isLoadingReject ? (
            <AuroraSpinner />
          ) : (
            <>
              {" "}
              <Typography>Approval Request Reason</Typography>
              <TextField
                disabled
                multiline
                rows={4}
                value={reason}
                fullWidth
                sx={{ marginY: "15px" }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            loading={isLoadingApprove}
            loadingPosition="start"
            onClick={() => handleApprove()}
          >
            Approve
          </Button>
          <Button
            loading={isLoadingApprove}
            loadingPosition="start"
            onClick={() => {
              handleReject();
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </ResponsiveDialog>
      <RejectConfirmationDialog
        reject={reject}
        remarks={remarks}
        setRemarks={setRemarks}
        isRejectConfirmDialogOpen={isRejectConfirmDialogOpen}
        setIsRejectConfirmDialogOpen={setIsRejectConfirmDialogOpen}
        setIsForSurveyApprovalOpen={setIsForSurveyApprovalOpen}
        weeklyID={weeklyID}
      />
    </>
  );
};

export default ForSurveyApproverDialog;
