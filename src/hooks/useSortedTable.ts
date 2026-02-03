import { useState, useMemo } from "react";

// Define the sort order type
type SortOrder = "asc" | "desc";

// Define cell value types similar to the TableComponent
type PrimitiveValue = string | number | boolean | Date | null | undefined;
type ObjectValue = Record<string, unknown>;
type ArrayValue = unknown[];
type CellValue<T = unknown> = PrimitiveValue | ObjectValue | ArrayValue | T;

// Define a type for column definitions
interface ColumnDefinition<T, K = unknown> {
	id: string;
	getValue: (item: T) => CellValue<K>;
}

export function useSortedTable<T, K = unknown>(data: T[], columns: ColumnDefinition<T, K>[]) {
	const [sortKey, setSortKey] = useState<string | null>(null);
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

	const sortedData = useMemo(() => {
		if (!sortKey) return data;

		const columnToSort = columns.find((col) => col.id === sortKey);
		if (!columnToSort) return data;

		return [...data].sort((a, b) => {
			const aValue = columnToSort.getValue(a);
			const bValue = columnToSort.getValue(b);

			// Handle Date comparisons
			if (aValue instanceof Date && bValue instanceof Date) {
				return sortOrder === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
			}

			// Handle number comparisons
			if (typeof aValue === "number" && typeof bValue === "number") {
				return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
			}

			// Default string comparison
			// Convert to string only if not already a string to avoid unnecessary conversions
			const aString = typeof aValue === "string" ? aValue : String(aValue ?? "");
			const bString = typeof bValue === "string" ? bValue : String(bValue ?? "");

			return sortOrder === "asc" ? aString.localeCompare(bString) : bString.localeCompare(aString);
		});
	}, [data, sortKey, sortOrder, columns]);

	const requestSort = (key: string) => {
		if (sortKey === key) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortKey(key);
			setSortOrder("asc");
		}
	};

	const resetSort = () => {
		setSortKey(null);
		setSortOrder("asc");
	};

	return {
		sortedData,
		requestSort,
		resetSort,
		sortKey,
		sortOrder,
	};
}
