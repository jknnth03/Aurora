import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useRef } from "react";
import { useSelector } from "react-redux";
import { ResponsiveDialog } from "../../../../components/ui/responsive-dialog";
import { MODULES } from "../../../../config/modules/modules";
import { ongoingMutation } from "../../../../features/slices/auth-slice";
import { useOpenCreate } from "../../../../hooks/useOpenCreate";
import { useOpenUpdate } from "../../../../hooks/useOpenUpdate";
import ScoreRatingForm, { ScoreRatingFormHandle } from "../score-rating-form";
const ScoreRatingDialog = () => {
  const mutation = useSelector(ongoingMutation);
  const { isOpen: isCreateOpen } = useOpenCreate();
  const { close: closeUpdate, isOpen: isUpdateOpen } = useOpenUpdate();

  const scoreRatingFormRef = useRef<ScoreRatingFormHandle>(null);

  const handleFormSubmit = async () => {
    if (scoreRatingFormRef.current) {
      try {
        await scoreRatingFormRef.current.submitForm();
      } catch (error) {}
    }
  };

  const handleFormReset = () => {
    if (scoreRatingFormRef.current) {
      scoreRatingFormRef.current.resetForm();
    }
  };
  const openDialogCreate = isCreateOpen(
    MODULES.MASTERLIST.CHILDREN.SCORE_RATING.ALIAS
  );

  const openDialogUpdate = isUpdateOpen(
    MODULES.MASTERLIST.CHILDREN.SCORE_RATING.ALIAS
  );

  const isFormSubmitting =
    Object.values(mutation).find(
      (item) =>
        item?.endpointName === "createScoreRating" ||
        item?.endpointName === "updateScoreRating"
    )?.status === "pending";

  return (
    <ResponsiveDialog
      open={openDialogCreate || openDialogUpdate}
      onClose={() => {
        closeUpdate();
        handleFormReset();
      }}
      disableClickAway={true}
    >
      <DialogTitle>
        {openDialogCreate ? "Create" : "Update"} Score Rating
      </DialogTitle>
      <DialogContent>
        <ScoreRatingForm
          isEditMode={openDialogUpdate}
          ref={scoreRatingFormRef}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={handleFormSubmit}
          loading={isFormSubmitting}
          loadingPosition="start"
        >
          Submit
        </Button>
        <Button onClick={handleFormReset}>Reset</Button>
      </DialogActions>
    </ResponsiveDialog>
  );
};

export default ScoreRatingDialog;
