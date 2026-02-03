import React, { JSX, useCallback, useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import { CloudArrowUp, Trash, File, FileText, FilePdf, FileMd, FileDoc } from "@phosphor-icons/react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";

// TypeScript interfaces
interface UploadContainerProps {
	isDragActive?: boolean;
	hasFile?: boolean;
	error?: boolean;
}

interface FileFieldProps {
	value?: File | null;
	onChange: (file: File | File[] | null) => void;
	accept?: string;
	maxSize?: number;
	error?: string;
	helperText?: string;
	disabled?: boolean;
	label?: string;
	multiple?: boolean;
	showProgress?: boolean;
	progress?: number;
}

// Styled components for modern look
const UploadContainer = styled(Box)<UploadContainerProps>(({ theme, isDragActive, hasFile, error }) => ({
	border: `2px dashed ${
		error
			? theme.palette.error.main
			: isDragActive
			? theme.palette.primary.main
			: hasFile
			? theme.palette.success.main
			: theme.palette.divider
	}`,
	borderRadius: theme.spacing(2),
	padding: theme.spacing(3),
	textAlign: hasFile ? "left" : "center",
	cursor: "pointer",
	transition: "all 0.3s ease",
	backgroundColor: isDragActive
		? theme.palette.action.hover
		: hasFile
		? theme.palette.success.light + "10"
		: "transparent",
	"&:hover": {
		borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
		backgroundColor: theme.palette.action.hover,
	},
	display: "flex",
	flexDirection: hasFile ? "row" : "column",
	alignItems: hasFile ? "center" : "center",
	gap: hasFile ? theme.spacing(2) : 0,
}));

// File type icon mapping
const getFileIcon = (fileName: string): JSX.Element => {
	const extension = fileName?.split(".").pop()?.toLowerCase();

	switch (extension) {
		case "pdf":
			return <FilePdf size={24} color="#d32f2f" />;
		case "md":
			return <FileMd size={24} color="#1976d2" />;
		case "txt":
			return <FileText size={24} color="#1976d2" />;
		case "doc":
		case "docx":
			return <FileDoc size={24} color="#0288d1" />;
		default:
			return <File size={24} color="#757575" />;
	}
};

// Format file size
const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const FileField: React.FC<FileFieldProps> = ({
	value,
	onChange,
	accept = ".txt,.md,.pdf,.doc,.docx",
	maxSize = 10 * 1024 * 1024, // 10MB default
	error,
	helperText,
	disabled = false,
	label = "Upload File",
	multiple = false,
	showProgress = false,
	progress = 0,
}) => {
	const [isDragActive, setIsDragActive] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDragEnter = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			if (!disabled) {
				setIsDragActive(true);
			}
		},
		[disabled]
	);

	const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragActive(false);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const validateFile = useCallback(
		(file: File): string | null => {
			// Check file size
			if (file.size > maxSize) {
				return `File size must be less than ${formatFileSize(maxSize)}`;
			}

			// Check file type if accept is specified
			if (accept) {
				const acceptedTypes = accept.split(",").map((type) => type.trim().toLowerCase());
				const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

				if (!acceptedTypes.includes(fileExtension)) {
					return `File type not supported. Accepted types: ${accept}`;
				}
			}

			return null;
		},
		[accept, maxSize]
	);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragActive(false);

			if (disabled) return;

			const files = Array.from(e.dataTransfer.files);
			const file = files[0]; // Take first file if not multiple

			if (file) {
				const validationError = validateFile(file);
				if (validationError) {
					console.error(validationError);
					return;
				}
				onChange(multiple ? files : file);
			}
		},
		[disabled, multiple, onChange, validateFile]
	);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(e.target.files || []);
			const file = files[0];

			if (file) {
				const validationError = validateFile(file);
				if (validationError) {
					console.error(validationError);
					return;
				}
				onChange(multiple ? files : file);
			}
		},
		[multiple, onChange, validateFile]
	);

	const handleRemoveFile = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onChange(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		},
		[onChange]
	);

	const handleClick = useCallback(() => {
		if (!disabled && fileInputRef.current) {
			fileInputRef.current.click();
		}
	}, [disabled]);

	return (
		<Box>
			<input
				ref={fileInputRef}
				type="file"
				accept={accept}
				multiple={multiple}
				onChange={handleFileSelect}
				style={{ display: "none" }}
				disabled={disabled}
			/>

			<UploadContainer
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				onClick={handleClick}
				isDragActive={isDragActive}
				hasFile={!!value}
				error={!!error}
			>
				{value ? (
					// File preview mode
					<Box display={"flex"} alignItems={"center"} gap={2} width={"100%"}>
						{getFileIcon(value.name)}
						<Box sx={{ flex: 1, textAlign: "left" }}>
							<Typography variant="body2" fontWeight="medium">
								{value.name}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{formatFileSize(value.size)}
							</Typography>
						</Box>
						<IconButton
							size="small"
							onClick={handleRemoveFile}
							disabled={disabled}
							color="error"
							sx={{ ml: "auto", justifySelf: "flex-end" }}
						>
							<Trash size={16} />
						</IconButton>
					</Box>
				) : (
					// Upload mode
					<>
						<CloudArrowUp
							size={48}
							color={error ? "#d32f2f" : isDragActive ? "#1976d2" : "#757575"}
							style={{ marginBottom: 16 }}
						/>

						<Typography variant="h6" gutterBottom>
							{isDragActive ? "Drop file here" : label}
						</Typography>

						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							{isDragActive ? "Release to upload" : "Drag and drop a file here, or click to browse"}
						</Typography>

						<Button
							variant="outlined"
							size="small"
							disabled={disabled}
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation();
								handleClick();
							}}
						>
							Browse Files
						</Button>

						{accept && (
							<Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
								Accepted types: {accept}
							</Typography>
						)}
					</>
				)}
			</UploadContainer>

			{/* Progress bar */}
			{showProgress && progress > 0 && (
				<Box sx={{ mt: 2 }}>
					<LinearProgress variant="determinate" value={progress} />
					<Typography variant="caption" sx={{ mt: 0.5 }}>
						Uploading: {progress}%
					</Typography>
				</Box>
			)}

			{/* Helper/Error text */}
			{(helperText || error) && (
				<Typography
					variant="caption"
					color={error ? "error" : "text.secondary"}
					sx={{ mt: 1, display: "block" }}
				>
					{error || helperText}
				</Typography>
			)}
		</Box>
	);
};

export default FileField;
