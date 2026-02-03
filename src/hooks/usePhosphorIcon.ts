import { cloneElement, isValidElement, ReactNode, ReactElement, SVGProps } from "react";

// Phosphor icon props based on actual package types
interface PhosphorIconProps extends SVGProps<SVGSVGElement> {
	size?: string | number;
	color?: string;
	weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
	mirrored?: boolean;
}

// Generic type for React elements that can accept phosphor props
type PhosphorReactElement = ReactElement<PhosphorIconProps>;

// Type guard to check if a ReactNode is a valid ReactElement
function isPhosphorElement(icon: ReactNode): icon is PhosphorReactElement {
	return isValidElement(icon);
}

export const usePhosphorIcon = () => {
	const enhanceIcon = <T extends PhosphorIconProps>(
		icon: ReactNode,
		customProps: Partial<T> = {} as Partial<T>
	): ReactNode => {
		if (!isPhosphorElement(icon)) {
			return icon;
		}

		// TypeScript now knows icon is a ReactElement with PhosphorIconProps
		return cloneElement(icon, customProps);
	};

	return { enhanceIcon };
};

// Component version with proper generic typing
interface PhosphorIconComponentProps {
	icon: ReactNode;
}

export const PhosphorIcon = <T extends PhosphorIconProps = PhosphorIconProps>({
	icon,
	...props
}: PhosphorIconComponentProps & Omit<T, keyof PhosphorIconComponentProps>) => {
	const { enhanceIcon } = usePhosphorIcon();
	return enhanceIcon<T>(icon, props as unknown as Partial<T>);
};
