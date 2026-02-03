// Configuration options for FormData conversion
interface FormDataOptions {
  arrayFormat?: "indices" | "brackets" | "repeat"; // key[0], key[], key (multiple)
  skipNulls?: boolean;
  skipEmptyStrings?: boolean;
}

// Supported value types for FormData conversion
type FormDataValue =
  | string
  | number
  | boolean
  | File
  | Blob
  | Date
  | null
  | undefined;

type FormDataInput = Record<
  string,
  FormDataValue | FormDataValue[] | Record<string, FormDataValue>
>;

export const modifyAsFormData = <T extends FormDataInput>(
  data: T,
  options: FormDataOptions = {},
): FormData => {
  const {
    arrayFormat = "repeat", // Most common format for APIs
    skipNulls = true,
    skipEmptyStrings = false,
  } = options;

  const formData = new FormData();

  const appendValue = (key: string, value: FormDataValue): void => {
    // Skip null/undefined values if configured
    if (skipNulls && (value === null || value === undefined)) {
      return;
    }

    // Skip empty strings if configured
    if (skipEmptyStrings && value === "") {
      return;
    }

    // Handle different value types
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else if (value === null || value === undefined) {
      formData.append(key, "");
    } else {
      formData.append(key, String(value));
    }
  };

  const processValue = (
    key: string,
    value: FormDataValue | FormDataValue[] | Record<string, FormDataValue>,
  ): void => {
    if (Array.isArray(value)) {
      // Handle arrays based on format preference
      value.forEach((item, index) => {
        if (arrayFormat === "indices") {
          appendValue(`${key}[${index}]`, item);
        } else if (arrayFormat === "brackets") {
          appendValue(`${key}[]`, item);
        } else {
          // repeat
          appendValue(key, item);
        }
      });
    } else if (
      value !== null &&
      typeof value === "object" &&
      !(value instanceof File) &&
      !(value instanceof Blob) &&
      !(value instanceof Date)
    ) {
      // Handle nested objects (flatten them)
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        processValue(`${key}[${nestedKey}]`, nestedValue);
      });
    } else {
      // Handle primitive values, Files, Blobs, Dates
      appendValue(key, value);
    }
  };

  // Process all entries in the data object
  Object.entries(data).forEach(([key, value]) => {
    processValue(key, value);
  });

  return formData;
};

// Utility function to convert FormData back to object (for debugging)
export const modifyFormDataAsObject = (
  formData: FormData,
): Record<string, any> => {
  const result: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
    if (result[key]) {
      // Convert to array if multiple values exist
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }

  return result;
};
