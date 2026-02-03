import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useRef } from "react";
import { ResponsiveDialog } from "../../../../components/ui/responsive-dialog";
import { MODULES } from "../../../../config/modules/modules";
import { useOpenCreate } from "../../../../hooks/useOpenCreate";
import { useOpenUpdate } from "../../../../hooks/useOpenUpdate";
import RoleForm, { RoleFormHandle } from "../role-form";
import { useSelector } from "react-redux";
import { ongoingMutation } from "../../../../features/slices/auth-slice";
const RoleDialog = () => {
  const mutation = useSelector(ongoingMutation);
  const { isOpen: isCreateOpen } = useOpenCreate();
  const { close: closeUpdate, isOpen: isUpdateOpen } = useOpenUpdate();
  const roleFormRef = useRef<RoleFormHandle>(null);

  const handleFormSubmit = async () => {
    if (roleFormRef.current) {
      try {
        await roleFormRef.current.submitForm();
      } catch (error) {}
    }
  };

  const handleFormReset = () => {
    if (roleFormRef.current) {
      roleFormRef.current.resetForm();
    }
  };
  const openDialogCreate = isCreateOpen(
    MODULES.MASTERLIST.CHILDREN.ROLES.ALIAS
  );

  const openDialogUpdate = isUpdateOpen(
    MODULES.MASTERLIST.CHILDREN.ROLES.ALIAS
  );

  const isFormSubmitting =
    Object.values(mutation).find(
      (item) =>
        item?.endpointName === "createRole" ||
        item?.endpointName === "updateRole"
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
      <DialogTitle>{openDialogCreate ? "Create" : "Update"} ROLE</DialogTitle>
      <DialogContent>
        <RoleForm isEditMode={openDialogUpdate} ref={roleFormRef} />
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

export default RoleDialog;
