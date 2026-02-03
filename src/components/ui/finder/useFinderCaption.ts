import { useState, useEffect, useCallback, useMemo } from "react";

// TypeScript types
type FinderCaption = string;

interface UseFinderCaptionOptions {
	autoRotate?: boolean;
	rotationInterval?: number;
	initialCaption?: string;
}

interface UseFinderCaptionReturn {
	currentCaption: FinderCaption;
	getRandomCaption: () => FinderCaption;
	getMultipleUniqueCaptons: (count?: number) => FinderCaption[];
	refreshCaption: () => void;
}

// Constants - memoized to prevent recreation
const FINDER_CAPTIONS: readonly FinderCaption[] = [
	"What are you moo-ving to find?",
	"Don't have a cow, just search!",
	"Holy cow, search something!",
	"Cow-me on, search something!",
	"Moo-ve it! What are you looking for?",
	"Moo-d for a search?",
	"What can I moo-nitor for you?",
	"Moo-re info needed? Search here!",
	"Ready to moo-ve through some data?",
	"Moo-ve over, start searching!",
	"Cow-me and get it! Search now!",
	"Time to moo-ve! What's your search?",
	"Got moo-re to find? Search away!",
	"Cow-nt you search for something?",
	"Moo-ch better results await!",
	"No bull, just search!",
	"Udderly ready to search?",
	"Moo and improved search awaits!",
	"Outstanding in your field of search!",
] as const;

// Custom React Hook
export const useFinderCaption = ({
	autoRotate = false,
	rotationInterval = 30000,
	initialCaption,
}: UseFinderCaptionOptions = {}): UseFinderCaptionReturn => {
	// Memoized random caption generator
	const getRandomCaption = useCallback((): FinderCaption => {
		const randomIndex = Math.floor(Math.random() * FINDER_CAPTIONS.length);
		return FINDER_CAPTIONS[randomIndex];
	}, []);

	// Initialize state with random or provided caption
	const [currentCaption, setCurrentCaption] = useState<FinderCaption>(() => initialCaption || getRandomCaption());

	// Memoized function for getting multiple unique captions
	const getMultipleUniqueCaptons = useCallback((count: number = 3): FinderCaption[] => {
		const shuffled = [...FINDER_CAPTIONS].sort(() => 0.5 - Math.random());
		return shuffled.slice(0, Math.min(count, FINDER_CAPTIONS.length));
	}, []);

	// Refresh current caption
	const refreshCaption = useCallback(() => {
		setCurrentCaption(getRandomCaption());
	}, [getRandomCaption]);

	// Auto-rotation effect
	useEffect(() => {
		if (!autoRotate) return;

		const interval = setInterval(refreshCaption, rotationInterval);
		return () => clearInterval(interval);
	}, [autoRotate, rotationInterval, refreshCaption]);

	return useMemo(
		() => ({
			currentCaption,
			getRandomCaption,
			getMultipleUniqueCaptons,
			refreshCaption,
		}),
		[currentCaption, getRandomCaption, getMultipleUniqueCaptons, refreshCaption]
	);
};
