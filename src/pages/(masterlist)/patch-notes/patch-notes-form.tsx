import { zodResolver } from "@hookform/resolvers/zod";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";

import { useSnackbar } from "notistack";

import AuroraSpinner from "../../../components/ui/aurora-spinner/aurora-spinner";
import Input from "../../../components/ui/input/input";

import { dialogFromMDEditor } from "../../../components/dialogs/markdown-editor-dialog";
import FileField from "../../../components/ui/file-field/file-field";
import { getAllPatchNoteTypes } from "../../../config/patch-note-items";
import {
  useCreatePatchNoteMutation,
  useGetPatchNoteQuery,
  useUpdatePatchNoteMutation,
} from "../../../features/api/aurora/masterlist/patch-notes.api";
import {
  ApiError,
  isApiErrorResponse,
} from "../../../features/api/aurora/types/types";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";

// Import patch note types configuration

// Define the patch note form schema
export const patchNoteFormSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  file: z.instanceof(File).optional(),
  is_published: z.boolean(),
  type: z.string().min(1, "Type is required"),
  version: z.string().min(1, "Version is required").trim(),
  id: z.string().optional(),
});

// Define the patch note form data type
export type PatchNoteFormData = z.infer<typeof patchNoteFormSchema>;

// Define the ref handle methods interface
export interface PatchNoteFormHandle {
  submitForm: () => Promise<void>;
  resetForm: () => void;
  isLoading: boolean;
}

interface PatchNoteFormProps {
  isEditMode: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PatchNoteForm = forwardRef<PatchNoteFormHandle, PatchNoteFormProps>(
  ({ isEditMode, onSuccess, onCancel }, ref) => {
    const { enqueueSnackbar } = useSnackbar();
    const { currentParams } = useRememberQueryParams();
    const { close: closeCreate } = useOpenCreate();
    const isFromEditor = JSON.parse(
      currentParams[dialogFromMDEditor] ?? "false"
    );

    // Generate type options from configuration
    const typeOptions = useMemo(() => {
      return getAllPatchNoteTypes().map(({ key, config }) => ({
        value: key,
        label: config.label,
        icon: config.icon,
        color: config.color,
        description: config.description,
      }));
    }, []);

    // State to hold the converted file from blob (only if available)
    const [mdFileFromBlob, setMdFileFromBlob] = useState<File | null>(null);

    // Function to convert blob URL to File object (only if blob exists)
    const convertBlobToFile = useCallback(async (): Promise<void> => {
      const blobUrl = sessionStorage.getItem("mdBlob");

      // Only proceed if blob exists and not in edit mode
      if (!blobUrl || isEditMode) {
        return;
      }

      try {
        const response = await fetch(blobUrl);
        const blob = await response.blob();

        // Create a File object from the blob
        const file = new File([blob], "AuroraMarkdown.md", {
          type: "text/markdown",
          lastModified: Date.now(),
        });

        setMdFileFromBlob(file);
      } catch (error) {
        console.error("Error converting blob to File:", error);
        setMdFileFromBlob(null);
      }
    }, [isEditMode]);

    // Convert blob to file on component mount (only if available)
    useEffect(() => {
      if (isFromEditor) {
        convertBlobToFile();
      }
    }, [convertBlobToFile]);

    const { data: patchNoteData, isLoading: isLoadingPatchNote } =
      useGetPatchNoteQuery(currentParams.id, {
        skip: !isEditMode || !currentParams.id,
      });

    // RTK Query mutations
    const [createPatchNote, { isLoading: isCreating }] =
      useCreatePatchNoteMutation();
    const [updatePatchNote, { isLoading: isUpdating }] =
      useUpdatePatchNoteMutation();

    const isLoading = isCreating || isUpdating;

    // Set up form with default values
    const defaultValues = useMemo<PatchNoteFormData>(() => {
      if (isEditMode && patchNoteData?.data) {
        const patchNote = patchNoteData.data;
        return {
          title: patchNote.title || "",
          description: patchNote.description || "",
          file: undefined,
          is_published: Boolean(patchNote.is_published),
          type: patchNote.type || "FEAT",
          version: patchNote.version || "",
        };
      }

      return {
        title: "",
        description: "",
        file: mdFileFromBlob || undefined, // Only set if blob file exists
        is_published: false,
        type: "FEAT",
        version: "",
      };
    }, [isEditMode, patchNoteData, mdFileFromBlob]);

    const {
      control,
      handleSubmit,
      reset,
      formState: { errors, isDirty },
    } = useForm<PatchNoteFormData>({
      resolver: zodResolver(patchNoteFormSchema),
      defaultValues,
    });

    useEffect(() => {
      if (isEditMode && patchNoteData?.data) {
        const patchNote = patchNoteData.data;
        reset({
          title: patchNote.title || "",
          description: patchNote.description || "",
          file: undefined,
          is_published: Boolean(patchNote.is_published),
          type: patchNote.type || "FEAT",
          version: patchNote.version || "",
        });
      }
    }, [isEditMode, patchNoteData, reset]);

    // Reset form when blob file becomes available (for create mode)
    useEffect(() => {
      if (!isEditMode && mdFileFromBlob) {
        reset({
          title: "",
          description: "",
          file: mdFileFromBlob,
          is_published: false,
          type: "FEAT",
          version: "",
        });
      }
    }, [mdFileFromBlob, isEditMode, reset]);

    const createPatchNoteHandler = useCallback(
      async (data: PatchNoteFormData) => {
        // Create FormData for file upload (same as update handler)
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("is_published", data.is_published ? "1" : "0");
        formData.append("type", data.type);
        formData.append("version", data.version);

        if (data.file) {
          formData.append("file", data.file);
        }

        const response = await createPatchNote(formData).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Patch note created successfully!",
        });
        onSuccess?.();
      },
      [createPatchNote, enqueueSnackbar, onSuccess]
    );
    const updatePatchNoteHandler = useCallback(
      async (data: PatchNoteFormData) => {
        if (!currentParams.id)
          throw new Error("No patch note ID provided for update");

        // Create FormData for file upload
        const formData = new FormData();
        formData.append("id", currentParams.id);
        formData.append("_method", "PUT");
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("is_published", data.is_published ? "1" : "0");
        formData.append("type", data.type);
        formData.append("version", data.version);

        if (data.file) {
          formData.append("file", data.file);
        }

        const response = await updatePatchNote(formData).unwrap();
        enqueueSnackbar({
          variant: "success",
          message: response?.message ?? "Patch note updated successfully!",
        });
        onSuccess?.();
      },
      [updatePatchNote, currentParams.id, enqueueSnackbar, onSuccess]
    );

    const handlePatchNoteSubmit = useCallback(
      async (data: PatchNoteFormData) => {
        if (isEditMode && !isDirty) {
          enqueueSnackbar({
            variant: "warning",
            message: "No changes.",
          });
          return;
        }

        try {
          if (isEditMode) {
            await updatePatchNoteHandler(data);
          } else {
            await createPatchNoteHandler(data);
          }
          closeCreate();
        } catch (_error) {
          if (isApiErrorResponse(_error)) {
            _error?.data?.errors.forEach((err: ApiError) => {
              enqueueSnackbar({ variant: "error", message: err.detail });
            });
          }
          throw _error;
        }
      },
      [
        isEditMode,
        isDirty,
        updatePatchNoteHandler,
        createPatchNoteHandler,
        enqueueSnackbar,
        closeCreate,
      ]
    );

    const submitForm = useCallback(async (): Promise<void> => {
      if (isEditMode && !isDirty) {
        enqueueSnackbar({
          variant: "warning",
          message: "No changes.",
        });
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const onSubmitWrapper = async (data: PatchNoteFormData) => {
          try {
            await handlePatchNoteSubmit(data);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        handleSubmit(onSubmitWrapper)();
      });
    }, [
      handleSubmit,
      handlePatchNoteSubmit,
      isEditMode,
      isDirty,
      enqueueSnackbar,
    ]);

    const resetForm = useCallback(() => {
      reset(defaultValues);
    }, [reset, defaultValues]);

    useImperativeHandle(
      ref,
      () => ({
        submitForm,
        resetForm,
        isLoading,
      }),
      [submitForm, resetForm, isLoading]
    );

    const onSubmit = async (data: PatchNoteFormData) => {
      if (isEditMode && !isDirty) {
        enqueueSnackbar({
          variant: "warning",
          message: "No changes.",
        });
        return;
      }

      try {
        await handlePatchNoteSubmit(data);
      } catch (error) {}
    };

    // Handle loading state for edit mode
    if (isEditMode && isLoadingPatchNote) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <Box display="flex">
            <AuroraSpinner />
          </Box>
        </Box>
      );
    }

    return (
      <>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 1 }}
        >
          <Grid container spacing={2}>
            {/* File Upload Field */}

            {/* Title Field */}
            <Grid size={9}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Title"
                    fullWidth
                    variant="outlined"
                    required
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            {/* Version and Type Fields */}
            <Grid size={3}>
              <Controller
                name="version"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Version"
                    fullWidth
                    variant="outlined"
                    required
                    error={!!errors.version}
                    helperText={errors.version?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel id="type-label">Type</InputLabel>
                    <Select
                      size="small"
                      {...field}
                      labelId="type-label"
                      label="Type"
                      required
                      disabled={isLoading}
                    >
                      {typeOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <MenuItem key={option.value} value={option.value}>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                              sx={{ width: "100%" }}
                            >
                              <IconComponent
                                size={16}
                                color={option.color}
                                weight="duotone"
                              />
                              <Box>
                                <Box component="span" sx={{ fontWeight: 500 }}>
                                  {option.label}
                                </Box>
                                <Box
                                  component="span"
                                  sx={{
                                    fontSize: "0.75rem",
                                    color: "text.secondary",
                                    display: "block",
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {option.description}
                                </Box>
                              </Box>
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {errors.type && (
                      <FormHelperText>{errors.type.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Description Field */}
            <Grid size={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Description"
                    fullWidth
                    variant="outlined"
                    required
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="file"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <FileField
                    value={value}
                    onChange={onChange}
                    accept=".txt,.md,.pdf,.doc,.docx"
                    maxSize={10 * 1024 * 1024} // 10MB
                    error={errors.file?.message}
                    helperText={
                      !errors.file?.message
                        ? "Optional: Upload a document file"
                        : undefined
                    }
                    disabled={isLoading}
                    label="Upload Attachment"
                  />
                )}
              />
            </Grid>

            {/* Published Switch */}
            <Grid size={12}>
              <Controller
                name="is_published"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                      />
                    }
                    label="Published"
                  />
                )}
              />
            </Grid>

            {/* Form Actions */}
            <Grid size={12} sx={{ mt: 2 }}>
              {!ref && (
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={onCancel ? onCancel : () => reset(defaultValues)}
                    disabled={isLoading}
                  >
                    {onCancel ? "Cancel" : "Reset"}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={
                      isCreating || isUpdating || (!isDirty && isEditMode)
                    }
                  >
                    {isCreating || isUpdating ? (
                      <CircularProgress size={24} />
                    ) : isEditMode ? (
                      "Update Patch Note"
                    ) : (
                      "Create Patch Note"
                    )}
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </>
    );
  }
);

export default PatchNoteForm;
