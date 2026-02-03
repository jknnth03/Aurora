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
import UserForm, { UserFormHandle } from "../user-form";
const UserDialog = () => {
  const mutation = useSelector(ongoingMutation);
  const { close: closeCreate, isOpen: isCreateOpen } = useOpenCreate();
  const { close: closeUpdate, isOpen: isUpdateOpen } = useOpenUpdate();

  const userFormRef = useRef<UserFormHandle>(null);

  const handleFormSubmit = async () => {
    if (userFormRef.current) {
      try {
        await userFormRef.current.submitForm();
      } catch (error) {}
    }
  };

  const handleFormReset = () => {
    if (userFormRef.current) {
      userFormRef.current.resetForm();
    }
  };
  const openDialogCreate = isCreateOpen(
    MODULES.MASTERLIST.CHILDREN.USERS.ALIAS
  );

  const openDialogUpdate = isUpdateOpen(
    MODULES.MASTERLIST.CHILDREN.USERS.ALIAS
  );

  const isFormSubmitting =
    Object.values(mutation).find(
      (item) =>
        item?.endpointName === "createUser" ||
        item?.endpointName === "updateUser"
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
      <DialogTitle>{openDialogCreate ? "Create" : "Update"} Users</DialogTitle>
      <DialogContent>
        <UserForm isEditMode={openDialogUpdate} ref={userFormRef} />
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

export default UserDialog;
