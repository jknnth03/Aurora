import Box from "@mui/material/Box";
import { Backspace, MagnifyingGlass } from "@phosphor-icons/react";
import { useDebounce } from "@uidotdev/usehooks";
import React, { useEffect, useState, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import Input, { InputProps } from "../input/input";
import { formatShortcut } from "../../../utils/formatShortcut";

export interface SearchFieldProps extends Omit<InputProps, "onChange"> {
  onDebounced?: (value: string) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  qKey?: string;
}

export const searchShortcut = "ctrl+k";

const SearchField = ({
  onDebounced,
  onChange,
  onInput,
  qKey = "q",
  ...props
}: SearchFieldProps) => {
  const { currentParams, setQueryParams, removeQueryParams } =
    useRememberQueryParams();
  const inputRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState(
    currentParams[qKey] !== undefined ? currentParams[qKey] : ""
  );

  // Hotkey to focus on search field
  useHotkeys(
    searchShortcut,
    (event) => {
      event.preventDefault();
      if (inputRef.current) {
        const input =
          inputRef.current.querySelector('input[name="TextField"]') ||
          inputRef.current.querySelector("input");
        if (input) {
          (input as HTMLInputElement).focus();
        }
      }
    },
    {
      preventDefault: true,
    }
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && inputRef.current) {
        const input =
          inputRef.current.querySelector('input[name="TextField"]') ||
          inputRef.current.querySelector("input");
        if (input && document.activeElement === input) {
          event.preventDefault();
          (input as HTMLInputElement).blur();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (currentParams[qKey] !== inputValue) {
      setInputValue(currentParams[qKey] || "");
    }
  }, [currentParams[qKey]]);

  const debouncedInputValue = useDebounce(inputValue, 500);

  const handleClearInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue("");
    removeQueryParams("q");
  };

  const endIcon = (
    <Backspace
      onClick={handleClearInput}
      style={{
        cursor: "pointer",
        opacity: inputValue ? 1 : 0,
        visibility: inputValue ? "visible" : "hidden",
        transition: "opacity 0.2s ease",
      }}
    />
  );

  // Update URL when debounced value changes
  useEffect(() => {
    if (debouncedInputValue) {
      setQueryParams({ [qKey]: debouncedInputValue }, { retain: true });
      if (onDebounced) onDebounced(debouncedInputValue);
    } else if (debouncedInputValue === "" && currentParams[qKey]) {
      removeQueryParams(qKey);
      if (onDebounced) onDebounced("");
    }
  }, [debouncedInputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (onInput) onInput(e);
    if (onChange) onChange(e);
  };

  return (
    <Box ref={inputRef}>
      <Input
        label="Search"
        name="TextField"
        value={inputValue}
        onChange={handleInputChange}
        onInput={onInput}
        startIcon={<MagnifyingGlass />}
        placeholder={`${formatShortcut(searchShortcut)} to focus`}
        endIcon={endIcon}
        sx={{ maxWidth: "80%" }}
        endAdornmentProps={{
          position: "end",
          sx: {
            minWidth: "24px",
            visibility: "visible",
          },
        }}
        tooltip={props.tooltip ?? "You can search your thoughts here."}
        {...props}
      />
    </Box>
  );
};

export default SearchField;
