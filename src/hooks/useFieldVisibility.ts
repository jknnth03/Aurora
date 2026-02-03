import { useState } from "react";

interface FieldVisibilityState {
	[fieldName: string]: boolean;
}

const useFieldVisibility = () => {
	// Initialize with an empty object, fields will be added dynamically
	const [visibility, setVisibility] = useState<FieldVisibilityState>({});

	// Toggle the visibility of a specific field
	const toggleFieldVisibility = (fieldName: string) => {
		setVisibility((prevVisibility) => ({
			...prevVisibility,
			[fieldName]: !prevVisibility[fieldName], // Toggle visibility for the specific field
		}));
	};

	// Reset all fields' visibility to hidden (false)
	const resetVisibility = () => {
		setVisibility({});
	};

	return { visibility, toggleFieldVisibility, resetVisibility };
};

export default useFieldVisibility;
