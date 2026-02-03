// BlurLazyImage.tsx
import { useState, useEffect, useRef, CSSProperties } from "react";
import "../../styles/lazy-image.scss";

interface BlurLazyImageProps {
	src: string;
	placeholderSrc: string; // Tiny version of the same image
	alt: string;
	width?: string | number;
	height?: string | number;
	className?: string;
	threshold?: number;
	transitionDuration?: number;
}

const BlurLazyImage: React.FC<BlurLazyImageProps> = ({
	src,
	placeholderSrc,
	alt,
	width,
	height,
	className = "",
	threshold = 0.1,
	transitionDuration = 0.3,
}) => {
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [isInView, setIsInView] = useState<boolean>(false);
	const imgRef = useRef<HTMLDivElement | null>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		observerRef.current = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setIsInView(true);
					observerRef.current?.disconnect();
				}
			},
			{ threshold }
		);

		if (imgRef.current) {
			observerRef.current.observe(imgRef.current);
		}

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [threshold]);

	const handleImageLoad = (): void => {
		setIsLoaded(true);
	};

	const containerStyle: CSSProperties = {
		position: "relative",
		width: width || "100%",
		height: height || "auto",
		overflow: "hidden",
	};

	const blurImageStyle: CSSProperties = {
		opacity: isLoaded ? 0 : 1,
		transition: `opacity ${transitionDuration}s ease-in-out`,
	};

	const mainImageStyle: CSSProperties = {
		opacity: isLoaded ? 1 : 0,
		transition: `opacity ${transitionDuration}s ease-in-out`,
	};

	return (
		<div ref={imgRef} className={`lazy-image-container ${className}`} style={containerStyle}>
			{/* Blur placeholder (tiny image stretched) */}
			{placeholderSrc && (
				<img
					src={placeholderSrc}
					alt=""
					className="lazy-image lazy-image-blur"
					style={blurImageStyle}
					aria-hidden="true"
				/>
			)}

			{/* Actual image - only load when in viewport */}
			{isInView && (
				<img src={src} alt={alt} onLoad={handleImageLoad} className="lazy-image" style={mainImageStyle} />
			)}
		</div>
	);
};

export default BlurLazyImage;
