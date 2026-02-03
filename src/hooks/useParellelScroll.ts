import { useRef, useEffect, useCallback, RefObject, createRef } from "react";

// Interface for scroll event information
export interface ScrollEventInfo<T extends HTMLElement = HTMLElement> {
	sourceIndex: number;
	scrollProperty: "scrollTop" | "scrollLeft";
	value: number;
	element: T | null;
}

// Interface for hook options
export interface UseConnectedScrollbarsOptions<T extends HTMLElement = HTMLElement> {
	/** Number of scrollable elements to connect */
	count?: number;
	/** Enable vertical scroll synchronization */
	syncVertical?: boolean;
	/** Enable horizontal scroll synchronization */
	syncHorizontal?: boolean;
	/** Debounce delay in milliseconds to prevent scroll loops */
	debounceMs?: number;
	/** Callback function called on scroll events */
	onScroll?: (info: ScrollEventInfo<T>) => void;
}

// Interface for hook return value with generic type support
export interface UseConnectedScrollbarsReturn<T extends HTMLElement = HTMLElement> {
	/** Array of refs to attach to scrollable elements */
	refs: RefObject<T | null>[];
	/** Programmatically scroll all elements to specific position */
	scrollTo: (scrollTop?: number, scrollLeft?: number) => void;
	/** Scroll all elements to top */
	scrollToTop: () => void;
	/** Scroll all elements to bottom */
	scrollToBottom: () => void;
	/** Current scrolling state */
	isScrolling: boolean;
}

/**
 * Custom hook for connecting multiple scrollable elements
 * When one element scrolls, all connected elements scroll in sync
 *
 * @param options Configuration options for the hook
 * @returns Object containing refs and utility functions
 *
 * @example
 * ```tsx
 * // For TableContainer (HTMLDivElement)
 * const { refs } = useConnectedScrollbars<HTMLDivElement>({
 *   count: 2,
 *   syncHorizontal: true
 * });
 *
 * // For TableHead (HTMLTableSectionElement)
 * const { refs } = useConnectedScrollbars<HTMLTableSectionElement>({
 *   count: 2,
 *   syncHorizontal: true
 * });
 * ```
 */
export const useParallelScroll = <T extends HTMLElement = HTMLElement>(
	options: UseConnectedScrollbarsOptions<T> = {}
): UseConnectedScrollbarsReturn<T> => {
	const { count = 2, syncVertical = true, syncHorizontal = false, debounceMs = 10, onScroll = null } = options;

	// Create refs array - this stays stable across renders
	const refs = useRef<RefObject<T | null>[]>([]);
	if (refs.current.length !== count) {
		refs.current = Array.from({ length: count }, () => createRef<T>());
	}

	const isScrollingRef = useRef<boolean>(false);

	// Sync scroll positions - Modified to handle both directions at once
	const syncScrollPositions = useCallback(
		(sourceIndex: number): void => {
			if (isScrollingRef.current) return;

			const sourceElement = refs.current[sourceIndex]?.current;
			if (!sourceElement) return;

			isScrollingRef.current = true;

			// Get current scroll values from source element
			const scrollTop = sourceElement.scrollTop;
			const scrollLeft = sourceElement.scrollLeft;

			// Update all other elements
			refs.current.forEach((ref, index) => {
				if (index !== sourceIndex && ref?.current) {
					if (syncVertical) {
						ref.current.scrollTop = scrollTop;
					}
					if (syncHorizontal) {
						ref.current.scrollLeft = scrollLeft;
					}
				}
			});

			// Call custom onScroll callback if provided - call for each enabled direction
			if (onScroll) {
				if (syncVertical) {
					onScroll({
						sourceIndex,
						scrollProperty: "scrollTop",
						value: scrollTop,
						element: sourceElement,
					});
				}
				if (syncHorizontal) {
					onScroll({
						sourceIndex,
						scrollProperty: "scrollLeft",
						value: scrollLeft,
						element: sourceElement,
					});
				}
			}

			// Reset the flag after a short delay
			setTimeout(() => {
				isScrollingRef.current = false;
			}, debounceMs);
		},
		[syncVertical, syncHorizontal, onScroll, debounceMs]
	);

	// Setup event listeners
	useEffect(() => {
		const cleanupFunctions: (() => void)[] = [];

		refs.current.forEach((ref, index) => {
			const element = ref?.current;
			if (!element) return;

			const handleScroll = (): void => {
				// Call syncScrollPositions once per scroll event
				// It will handle both directions internally based on sync flags
				syncScrollPositions(index);
			};

			element.addEventListener("scroll", handleScroll, { passive: true });

			cleanupFunctions.push(() => {
				element.removeEventListener("scroll", handleScroll);
			});
		});

		// Cleanup function
		return () => {
			cleanupFunctions.forEach((cleanup) => cleanup());
		};
	}, [syncScrollPositions]);

	// Utility functions
	const scrollTo = useCallback(
		(scrollTop?: number, scrollLeft?: number): void => {
			isScrollingRef.current = true;
			refs.current.forEach((ref) => {
				if (ref?.current) {
					if (scrollTop !== undefined) ref.current.scrollTop = scrollTop;
					if (scrollLeft !== undefined) ref.current.scrollLeft = scrollLeft;
				}
			});
			setTimeout(() => {
				isScrollingRef.current = false;
			}, debounceMs);
		},
		[debounceMs]
	);

	const scrollToTop = useCallback((): void => {
		scrollTo(0, undefined);
	}, [scrollTo]);

	const scrollToBottom = useCallback((): void => {
		const firstElement = refs.current[0]?.current;
		if (firstElement) {
			scrollTo(firstElement.scrollHeight, undefined);
		}
	}, [scrollTo]);

	return {
		refs: refs.current,
		scrollTo,
		scrollToTop,
		scrollToBottom,
		isScrolling: isScrollingRef.current,
	};
};
