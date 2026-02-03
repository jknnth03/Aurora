import { Control, Controller, FieldErrors } from "react-hook-form";
import { ChecklistSchema } from "../checklist.schema";
import Input from "../../../../components/ui/input/input";
import { X } from "@phosphor-icons/react";

const Option = ({
  questionType,
  optionIndex,
  sectionIndex,
  questionIndex,
  control,
  removeOption,
  errors,
}: {
  questionType: "multiple_choice" | "checkboxes" | "paragraph";
  optionIndex: number;
  sectionIndex: number;
  questionIndex: number;
  control: Control<ChecklistSchema>;
  removeOption: (index: number) => void;
  errors: FieldErrors<ChecklistSchema>;
}) => {
  return (
    <Controller
      control={control}
      name={`sections.${sectionIndex}.questions.${questionIndex}.options.${optionIndex}.option_text`}
      render={({ field }) => (
        <Input
          {...field}
          label={`Option ${optionIndex + 1}`}
          fullWidth
          variant="outlined"
          required
          endIcon={<X onClick={() => removeOption(optionIndex)} />}
          error={
            !!errors?.sections?.[sectionIndex]?.questions?.[questionIndex]
              ?.options?.[optionIndex]?.option_text
          }
          helperText={
            errors?.sections?.[sectionIndex]?.questions?.[questionIndex]
              ?.options?.[optionIndex]?.option_text?.message
          }
        />
      )}
    />
  );
};

export default Option;
