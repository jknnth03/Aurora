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
import { AreaFormHandle } from "../area-form";
import AreaForm from "../area-form";
const AreaDialog = () => {
  const mutation = useSelector(ongoingMutation);
  const { isOpen: isCreateOpen } = useOpenCreate();
  const { close: closeUpdate, isOpen: isUpdateOpen } = useOpenUpdate();

  const areaFormRef = useRef<AreaFormHandle>(null);

  const handleFormSubmit = async () => {
    if (areaFormRef.current) {
      try {
        await areaFormRef.current.submitForm();
      } catch (error) {}
    }
  };

  const handleFormReset = () => {
    if (areaFormRef.current) {
      areaFormRef.current.resetForm();
    }
  };
  const openDialogCreate = isCreateOpen(MODULES.MASTERLIST.CHILDREN.AREA.ALIAS);

  const openDialogUpdate = isUpdateOpen(MODULES.MASTERLIST.CHILDREN.AREA.ALIAS);

  const isFormSubmitting =
    Object.values(mutation).find(
      (item) =>
        item?.endpointName === "createArea" ||
        item?.endpointName === "updateArea"
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
      <DialogTitle>{openDialogCreate ? "Create" : "Update"} Areas</DialogTitle>
      <DialogContent>
        <AreaForm isEditMode={openDialogUpdate} ref={areaFormRef} />
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

export default AreaDialog;
