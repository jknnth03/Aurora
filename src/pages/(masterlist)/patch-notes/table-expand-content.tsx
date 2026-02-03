import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { MarkdownViewer } from "../../../components/ui/markdown/markdown-viewer";
import { IPatchNotesResponse, useGetPatchNoteFileQuery } from "../../../features/api/aurora/masterlist/patch-notes.api";

const ExpandedContent = ({ patch_notes }: { patch_notes: IPatchNotesResponse }) => {
	const filePath = patch_notes.filepath;
	const fileName = filePath.split("/").pop();
	const { data, isLoading, isFetching, error, isError, refetch } = useGetPatchNoteFileQuery(fileName ?? "");

	if (isLoading || isFetching)
		return (
			<Box display={"flex"} gap={2}>
				<Grid container width={"100%"}>
					<Grid size={12}>
						<Skeleton width={250} height={40} />
						<Skeleton width={"100%"} />
						<Skeleton width={"100%"} />
						<Skeleton width={"100%"} />
						<Skeleton width={"100%"} />
					</Grid>
				</Grid>
			</Box>
		);

	if (isError) {
		return (
			<Alert
				severity="error"
				icon={<ErrorOutlineIcon />}
				action={
					<IconButton color="inherit" size="small" onClick={() => refetch()} aria-label="Retry loading">
						<RefreshIcon />
					</IconButton>
				}
			>
				<AlertTitle>Failed to Load Content</AlertTitle>
				{error
					? `Error: ${(error as any)?.message || "Unknown error occurred"}`
					: "Unable to fetch patch notes content"}
			</Alert>
		);
	}

	if (!data) {
		return (
			<Alert severity="warning" icon={<ErrorOutlineIcon />}>
				<AlertTitle>No Content Available</AlertTitle>
				The patch notes file appears to be empty or could not be found.
			</Alert>
		);
	}

	return (
		<>
			<MarkdownViewer src={{ type: "text", content: data }} />
		</>
	);
};

export default ExpandedContent;
