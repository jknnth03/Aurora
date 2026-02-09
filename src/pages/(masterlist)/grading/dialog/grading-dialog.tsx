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
import GradingForm, { GradingFormHandle } from "../grading-form";

const GradingDialog = () => {
  const mutation = useSelector(ongoingMutation);
  const { isOpen: isCreateOpen, close: closeCreate } = useOpenCreate();
  const { close: closeUpdate, isOpen: isUpdateOpen } = useOpenUpdate();

  const gradingFormRef = useRef<GradingFormHandle>(null);

  const handleFormSubmit = async () => {
    if (gradingFormRef.current) {
      try {
        await gradingFormRef.current.submitForm();
      } catch (error) {}
    }
  };

  const handleFormReset = () => {
    if (gradingFormRef.current) {
      gradingFormRef.current.resetForm();
    }
  };

  const handleClose = () => {
    closeCreate();
    closeUpdate();
    handleFormReset();
  };

  const openDialogCreate = isCreateOpen(
    MODULES.MASTERLIST.CHILDREN.GRADING.ALIAS,
  );

  const openDialogUpdate = isUpdateOpen(
    MODULES.MASTERLIST.CHILDREN.GRADING.ALIAS,
  );

  const isFormSubmitting =
    Object.values(mutation).find(
      (item) =>
        item?.endpointName === "createGrading" ||
        item?.endpointName === "updateGrading",
    )?.status === "pending";

  return (
    <ResponsiveDialog
      open={openDialogCreate || openDialogUpdate}
      onClose={handleClose}
      disableClickAway={true}>
      <DialogTitle>
        {openDialogCreate ? "Create" : "Update"} Grading
      </DialogTitle>
      <DialogContent>
        <GradingForm isEditMode={openDialogUpdate} ref={gradingFormRef} />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={handleFormSubmit}
          loading={isFormSubmitting}
          loadingPosition="start">
          Submit
        </Button>
        <Button onClick={handleFormReset}>Reset</Button>
      </DialogActions>
    </ResponsiveDialog>
  );
};

export default GradingDialog;
