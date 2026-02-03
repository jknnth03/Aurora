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
import ChecklistForm from "../checklist-form";
import { ChecklistFormHandle } from "../checklist-form";
import { useRememberQueryParams } from "../../../../hooks/useRememberQueryParams";
import ChecklistUserForm, {
  ChecklistUserFormHandle,
} from "../checklist-user-form";
import { useOpenChecklist } from "../../../../hooks/useOpenChecklist";
import { RootState } from "../../../../app/store";

export const ChecklistDialog = ({
  isCreateChecklistQAOpen,
  setIsCreateChecklistQAOpen,
  isViewChecklistQAOpen,
  setIsViewChecklistQAOpen,
}: {
  isCreateChecklistQAOpen: {
    open: boolean;
    id: string | number;
  };
  setIsCreateChecklistQAOpen: React.Dispatch<
    React.SetStateAction<{ open: boolean; id: string }>
  >;
  isViewChecklistQAOpen: {
    open: boolean;
    id: string | number;
  };
  setIsViewChecklistQAOpen: React.Dispatch<
    React.SetStateAction<{ open: boolean; id: string }>
  >;
}) => {
  const mutation = useSelector(ongoingMutation);
  const { currentParams } = useRememberQueryParams();
  const { close: closeCreate, isOpen: isCreateOpen } = useOpenCreate();
  const { close: closeUpdate, isOpen: isUpdateOpen } = useOpenUpdate();
  const { close: closeUser, isOpen: isUserOpen } = useOpenChecklist();

  const isQAChecklistView = isViewChecklistQAOpen.open;
  const isQAChecklistCreate = isCreateChecklistQAOpen.open;

  const openDialogCreate = isCreateOpen(
    MODULES.MASTERLIST.CHILDREN.CHECKLIST.ALIAS
  );
  const openUserDialogForm = isUserOpen(
    MODULES.MASTERLIST.CHILDREN.CHECKLIST.ALIAS + "-user"
  );
  const openDialogUpdate = isUpdateOpen(
    MODULES.MASTERLIST.CHILDREN.CHECKLIST.ALIAS
  );

  const checklistFormRef = useRef<ChecklistFormHandle>(null);
  const checklistUserFormRef = useRef<ChecklistUserFormHandle>(null);
  const isUserForm = currentParams?.dg?.includes("view-checklist-user");
  const isCreateChecklist = currentParams?.dg?.includes("create-checklist");
  const touchedChecklistData = useSelector(
    (state: RootState) => state.qaDashboard.checklistData
  );

  const handleFormSubmit = async () => {
    try {
      if ((isUserForm || isQAChecklistCreate) && checklistUserFormRef.current) {
        await checklistUserFormRef.current.submitForm();
        setIsCreateChecklistQAOpen({ open: false, id: "" });
      } else if (checklistFormRef.current) {
        await checklistFormRef.current.submitForm();
        closeUpdate();
        closeCreate();
        closeUser();
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleFormReset = () => {
    if (isUserForm && checklistUserFormRef.current) {
      checklistUserFormRef.current.resetForm();
    } else if (checklistFormRef.current) {
      checklistFormRef.current.resetForm();
    }
  };

  const isFormSubmitting =
    Object.values(mutation).find(
      (item) =>
        item?.endpointName === "createQA" || item?.endpointName === "resurvey"
    )?.status === "pending";

  return (
    <ResponsiveDialog
      open={
        openDialogCreate ||
        openDialogUpdate ||
        openUserDialogForm ||
        isQAChecklistView ||
        isQAChecklistCreate
      }
      onClose={() => {
        if (openDialogCreate) closeCreate();
        if (openDialogUpdate) closeUpdate();
        if (openUserDialogForm) closeUser();
        if (isCreateChecklistQAOpen.open)
          setIsCreateChecklistQAOpen({ open: false, id: "" });
        if (isQAChecklistView)
          setIsViewChecklistQAOpen({ open: false, id: "" });
        handleFormReset();
      }}
      disableClickAway={false}
    >
      <DialogTitle>
        {!isUserForm && !isQAChecklistView && !isQAChecklistCreate
          ? openDialogCreate
            ? "Create"
            : "Update"
          : ""}{" "}
        Checklist
      </DialogTitle>
      <DialogContent>
        {isUserForm || isQAChecklistView || isQAChecklistCreate ? (
          <ChecklistUserForm
            isOpenUserForm={openUserDialogForm}
            ref={checklistUserFormRef}
            isSubmittingForm={isFormSubmitting}
            isCreateChecklistQAOpen={isCreateChecklistQAOpen}
            setIsCreateChecklistQAOpen={setIsCreateChecklistQAOpen}
          />
        ) : (
          <ChecklistForm isEditMode={openDialogUpdate} ref={checklistFormRef} />
        )}
      </DialogContent>
      {(!isUserForm ||
        touchedChecklistData.isViewStoreChecklist ||
        isCreateChecklist) &&
        !isQAChecklistView && (
          <DialogActions>
            <Button
              variant="contained"
              onClick={handleFormSubmit}
              loading={isFormSubmitting}
              loadingPosition="start"
            >
              Submit
            </Button>
            <Button
              onClick={handleFormReset}
              variant={"outlined"}
              loading={isFormSubmitting}
              loadingPosition="start"
            >
              Reset
            </Button>
          </DialogActions>
        )}
    </ResponsiveDialog>
  );
};

export default ChecklistDialog;
