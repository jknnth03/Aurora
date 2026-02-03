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
import RegionForm, { RegionFormHandle } from "../region-form";
const RegionDialog = () => {
  const mutation = useSelector(ongoingMutation);
  const { isOpen: isCreateOpen } = useOpenCreate();
  const { close: closeUpdate, isOpen: isUpdateOpen } = useOpenUpdate();

  const regionFormRef = useRef<RegionFormHandle>(null);

  const handleFormSubmit = async () => {
    if (regionFormRef.current) {
      try {
        await regionFormRef.current.submitForm();
      } catch (error) {}
    }
  };

  const handleFormReset = () => {
    if (regionFormRef.current) {
      regionFormRef.current.resetForm();
    }
  };
  const openDialogCreate = isCreateOpen(
    MODULES.MASTERLIST.CHILDREN.REGION.ALIAS
  );

  const openDialogUpdate = isUpdateOpen(
    MODULES.MASTERLIST.CHILDREN.REGION.ALIAS
  );

  const isFormSubmitting =
    Object.values(mutation).find(
      (item) =>
        item?.endpointName === "createRegion" ||
        item?.endpointName === "updateRegion"
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
        {openDialogCreate ? "Create" : "Update"} Regions
      </DialogTitle>
      <DialogContent>
        <RegionForm isEditMode={openDialogUpdate} ref={regionFormRef} />
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

export default RegionDialog;
