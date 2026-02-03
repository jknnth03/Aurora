import { useCallback, useState } from "react";

interface UseDisclosureReturn {
	open: boolean;
	onOpen: () => void;
	onClose: () => void;
	onToggle: () => void;
}

const useDisclosure = (defaultState: boolean = false): UseDisclosureReturn => {
	const [open, setOpen] = useState<boolean>(defaultState);

	const onOpen = useCallback(() => {
		setOpen(true);
	}, []);

	const onClose = useCallback(() => {
		setOpen(false);
	}, []);

	const onToggle = useCallback(() => {
		setOpen((state) => !state);
	}, []);

	return { open, onOpen, onClose, onToggle };
};

export default useDisclosure;
