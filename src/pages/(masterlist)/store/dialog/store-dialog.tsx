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
import { StoreFormHandle } from "../store-form";
import StoreForm from "../store-form";
const StoreDialog = () => {
  const mutation = useSelector(ongoingMutation);
  const { close: closeCreate, isOpen: isCreateOpen } = useOpenCreate();
  const { close: closeUpdate, isOpen: isUpdateOpen } = useOpenUpdate();

  const storeFormRef = useRef<StoreFormHandle>(null);

  const handleFormSubmit = async () => {
    if (storeFormRef.current) {
      try {
        await storeFormRef.current.submitForm();
      } catch (error) {}
    }
  };

  const handleFormReset = () => {
    if (storeFormRef.current) {
      storeFormRef.current.resetForm();
    }
  };
  const openDialogCreate = isCreateOpen(
    MODULES.MASTERLIST.CHILDREN.STORE.ALIAS
  );

  const openDialogUpdate = isUpdateOpen(
    MODULES.MASTERLIST.CHILDREN.STORE.ALIAS
  );

  const isFormSubmitting =
    Object.values(mutation).find(
      (item) =>
        item?.endpointName === "createStore" ||
        item?.endpointName === "updateStore"
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
      <DialogTitle>{openDialogCreate ? "Create" : "Update"} Store</DialogTitle>
      <DialogContent>
        <StoreForm isEditMode={openDialogUpdate} ref={storeFormRef} />
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

export default StoreDialog;
