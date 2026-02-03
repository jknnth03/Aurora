import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useRef } from "react";
import { ResponsiveDialog } from "../../../../components/ui/responsive-dialog";
import { MODULES } from "../../../../config/modules/modules";
import { useOpenCreate } from "../../../../hooks/useOpenCreate";
import { useOpenUpdate } from "../../../../hooks/useOpenUpdate";
import PatchNotesForm from "../patch-notes-form";
import { CONFIG } from "../../../../config/config";
import { useRememberQueryParams } from "../../../../hooks/useRememberQueryParams";
import { dialogFromMDEditor } from "../../../../components/dialogs/markdown-editor-dialog";
import { FileMd } from "@phosphor-icons/react";
import { RoleFormHandle } from "../../roles/role-form";
const PatchNotesDialog = () => {
	const { close: closeCreate, open, isOpen: isCreateOpen } = useOpenCreate();
	const { close: closeUpdate, isOpen: isUpdateOpen } = useOpenUpdate();

	const { removeQueryParams } = useRememberQueryParams();

	const userFormRef = useRef<RoleFormHandle>(null);

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
	const openDialogCreate = isCreateOpen(MODULES.MASTERLIST.CHILDREN.PATCH_NOTES.ALIAS);

	const openDialogUpdate = isUpdateOpen(MODULES.MASTERLIST.CHILDREN.PATCH_NOTES.ALIAS);
	const openMDCreate = () => open("mdown");

	return (
		<ResponsiveDialog
			open={openDialogCreate || openDialogUpdate}
			onClose={() => {
				closeUpdate({ additionalKeyToClose: dialogFromMDEditor });
				handleFormReset();
			}}
			disableClickAway={true}
		>
			<DialogTitle sx={{ display: "flex", gap: 2, alignItems: "center" }}>
				{openDialogCreate ? "Create" : "Update"} {MODULES.MASTERLIST.CHILDREN.PATCH_NOTES.ALIAS}
				<Button variant="outlined" startIcon={<FileMd />} size="small" onClick={openMDCreate}>
					Compose
				</Button>
			</DialogTitle>
			<DialogContent>
				<PatchNotesForm isEditMode={openDialogUpdate} ref={userFormRef} />
			</DialogContent>
			<DialogActions>
				<Button onClick={handleFormReset}>Reset</Button>
				<Button variant="contained" onClick={handleFormSubmit}>
					Submit
				</Button>
			</DialogActions>
		</ResponsiveDialog>
	);
};

export default PatchNotesDialog;
