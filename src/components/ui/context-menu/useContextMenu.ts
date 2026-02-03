// File: hooks/useContextMenu.ts
import { useState, useCallback } from "react";
import { ContextMenuState } from "./context-menu";





function useContextMenu<T>() {
	const [contextMenu, setContextMenu] = useState<ContextMenuState<T> | null>(null);

	const handleContextMenu = useCallback((event: React.MouseEvent, item: T) => {
		event.preventDefault();
		event.stopPropagation();

		setContextMenu({
			mouseX: event.clientX,
			mouseY: event.clientY,
			item,
		});
	}, []);

	const handleCloseContextMenu = useCallback(() => {
		setContextMenu(null);
	}, []);

	const setContextMenuPosition = useCallback((x: number, y: number, item: T) => {
		setContextMenu({
			mouseX: x,
			mouseY: y,
			item,
		});
	}, []);

	return {
		contextMenu,
		setContextMenu,
		handleContextMenu,
		handleCloseContextMenu,
		setContextMenuPosition,
	};
}

export default useContextMenu;
