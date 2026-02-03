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
import StoreChecklistForm, { StoreFormHandle } from "../store-checklist-form";
const StoreChecklistDialog = () => {
  const mutation = useSelector(ongoingMutation);
  const { close: closeCreate, isOpen: isCreateOpen } = useOpenCreate();
  const { close: closeUpdate, isOpen: isUpdateOpen } = useOpenUpdate();

  const storeChecklistFormRef = useRef<StoreFormHandle>(null);

  const handleFormSubmit = async () => {
    if (storeChecklistFormRef.current) {
      try {
        await storeChecklistFormRef.current.submitForm();
      } catch (error) {}
    }
  };

  const handleFormReset = () => {
    if (storeChecklistFormRef.current) {
      storeChecklistFormRef.current.resetForm();
    }
  };
  const openDialogCreate = isCreateOpen(
    MODULES.MASTERLIST.CHILDREN.STORE_CHECKLIST.ALIAS,
  );

  const openDialogUpdate = isUpdateOpen(
    MODULES.MASTERLIST.CHILDREN.STORE_CHECKLIST.ALIAS,
  );

  const isFormSubmitting =
    Object.values(mutation).find(
      (item) =>
        item?.endpointName === "createStoreChecklist" ||
        item?.endpointName === "updateStoreChecklist",
    )?.status === "pending";

  return (
    <ResponsiveDialog
      open={openDialogCreate || openDialogUpdate}
      onClose={() => {
        closeUpdate();
        handleFormReset();
      }}
      disableClickAway={true}
      maxHeight="50vh">
      <DialogTitle>
        {openDialogCreate ? "Create" : "Update"} Store Checklist
      </DialogTitle>
      <DialogContent>
        <StoreChecklistForm
          isEditMode={openDialogUpdate}
          ref={storeChecklistFormRef}
        />
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

export default StoreChecklistDialog;
