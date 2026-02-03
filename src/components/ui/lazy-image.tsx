// LazyImage.tsx
import { useState, useEffect, useRef } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
	src: string;
	alt: string;
	threshold?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, threshold = 0.1, ...imgProps }) => {
	const [isInView, setIsInView] = useState<boolean>(false);
	const imgRef = useRef<HTMLImageElement | null>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		observerRef.current = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setIsInView(true);
					// Disconnect observer once in view
					observerRef.current?.disconnect();
				}
			},
			{ threshold }
		);

		if (imgRef.current) {
			observerRef.current.observe(imgRef.current);
		}

		// Clean up observer when component unmounts
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [threshold]);

	// Just render a regular img tag with ref and src only when in view
	return <img ref={imgRef} src={isInView ? src : undefined} alt={alt} {...imgProps} />;
};

export default LazyImage;
