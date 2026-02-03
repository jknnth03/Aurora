import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useRef, useState } from "react";
import { MODULES } from "../../config/modules/modules";
import { affixes, useOpenCreate } from "../../hooks/useOpenCreate";
import MarkdownEditor, { MarkdownEditorRef } from "../ui/markdown/markdown-editor";
import { ResponsiveDialog } from "../ui/responsive-dialog";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import { CONFIG } from "../../config/config";
import SmartButton from "../ui/smart-button/smart-button";
import { ArrowBendUpRight, Download } from "@phosphor-icons/react";
import Box from "@mui/material/Box";

export const dialogFromMDEditor = "fromMDEditor";
export const markdownFileName = "AuroraMarkDown";

const MarkDownEditDialog = () => {
	const { close: closeCreate, isOpen: isCreateOpen } = useOpenCreate();
	const { setQueryParams, removeQueryParams } = useRememberQueryParams();
	const mdEditorRef = useRef<MarkdownEditorRef>(null);
	const initialMDFile = sessionStorage.getItem("mdFile") || undefined;
	const [sessionUrl, setSessionUrl] = useState(sessionStorage.getItem("mdBlob") ?? "");

	const triggerPatchCreation = () => {
		const currentContent = mdEditorRef.current?.getData();
		if (currentContent) {
			const blob = new Blob([currentContent], { type: "text/markdown" });
			const file = new File([currentContent], `${markdownFileName}.md`, { type: "text/markdown" });
			const url = URL.createObjectURL(blob);
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(file);
			sessionStorage.setItem("mdBlob", url);
			sessionStorage.setItem("mdFile", currentContent);
			setSessionUrl(url);
		}
		// open(MODULES.MASTERLIST.CHILDREN.PATCH_NOTES.ALIAS);
		setQueryParams(
			{
				[dialogFromMDEditor]: "true",
				[CONFIG.PREFIX.dialogPrefix]: affixes(MODULES.MASTERLIST.CHILDREN.PATCH_NOTES.ALIAS),
			},
			{ retain: true }
		);
		// const a = document.createElement("a");
		// a.href = url;
	};

	const triggerDownload = () => {
		mdEditorRef.current?.triggerDownload();
	};
	const isMarkdownEditOpen = isCreateOpen("mdown");

	return (
		<ResponsiveDialog
			open={isMarkdownEditOpen}
			onClose={() => {
				closeCreate();
				sessionStorage.removeItem("mdBlob");
				sessionStorage.removeItem("mdFile");
				URL.revokeObjectURL(sessionUrl);
			}}
			disableClickAway={true}
		>
			<DialogTitle>Markdown Editor</DialogTitle>
			<DialogContent>
				<Box overflow={"hidden"} height={"100%"}>
					<MarkdownEditor ref={mdEditorRef} initialValue={initialMDFile} />
				</Box>
			</DialogContent>
			<DialogActions>
				<SmartButton onClick={triggerDownload} startIcon={<Download />}>
					Download
				</SmartButton>
				<SmartButton variant="contained" onClick={triggerPatchCreation} startIcon={<ArrowBendUpRight />}>
					Proceed as Patch
				</SmartButton>
			</DialogActions>
		</ResponsiveDialog>
	);
};

export default MarkDownEditDialog;
