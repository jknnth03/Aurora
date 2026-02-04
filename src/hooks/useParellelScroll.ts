import { useRef, useEffect, useCallback, RefObject, createRef } from "react";

export interface ScrollEventInfo<T extends HTMLElement = HTMLElement> {
  sourceIndex: number;
  scrollProperty: "scrollTop" | "scrollLeft";
  value: number;
  element: T | null;
}

export interface UseConnectedScrollbarsOptions<
  T extends HTMLElement = HTMLElement,
> {
  count?: number;
  syncVertical?: boolean;
  syncHorizontal?: boolean;
  debounceMs?: number;
  onScroll?: (info: ScrollEventInfo<T>) => void;
}

export interface UseConnectedScrollbarsReturn<
  T extends HTMLElement = HTMLElement,
> {
  refs: RefObject<T | null>[];
  scrollTo: (scrollTop?: number, scrollLeft?: number) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  isScrolling: boolean;
}

export const useParallelScroll = <T extends HTMLElement = HTMLElement>(
  options: UseConnectedScrollbarsOptions<T> = {},
): UseConnectedScrollbarsReturn<T> => {
  const {
    count = 2,
    syncVertical = true,
    syncHorizontal = false,
    debounceMs = 10,
    onScroll = null,
  } = options;

  const refs = useRef<RefObject<T | null>[]>([]);
  if (refs.current.length !== count) {
    refs.current = Array.from({ length: count }, () => createRef<T>());
  }

  const isScrollingRef = useRef<boolean>(false);

  const syncScrollPositions = useCallback(
    (sourceIndex: number): void => {
      if (isScrollingRef.current) return;

      const sourceElement = refs.current[sourceIndex]?.current;
      if (!sourceElement) return;

      isScrollingRef.current = true;

      const scrollTop = sourceElement.scrollTop;
      const scrollLeft = sourceElement.scrollLeft;

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

      setTimeout(() => {
        isScrollingRef.current = false;
      }, debounceMs);
    },
    [syncVertical, syncHorizontal, onScroll, debounceMs],
  );

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    refs.current.forEach((ref, index) => {
      const element = ref?.current;
      if (!element) return;

      const handleScroll = (): void => {
        syncScrollPositions(index);
      };

      element.addEventListener("scroll", handleScroll, { passive: true });

      cleanupFunctions.push(() => {
        element.removeEventListener("scroll", handleScroll);
      });
    });

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [syncScrollPositions]);

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
    [debounceMs],
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
