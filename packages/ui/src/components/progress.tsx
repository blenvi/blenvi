"use client";

import { cn } from "@blenvi/ui/lib/utils";
import * as React from "react";

type ProgressProps = React.ComponentProps<"div"> & {
	value?: number | null;
	/** Tailwind classes for the filled portion (default: `bg-primary`). */
	indicatorClassName?: string;
};

function Progress({
	className,
	value = 0,
	indicatorClassName,
	...props
}: ProgressProps) {
	const v = Math.min(
		100,
		Math.max(
			0,
			typeof value === "number" && Number.isFinite(value) ? value : 0,
		),
	);
	return (
		<div
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(v)}
			data-slot="progress"
			className={cn(
				"relative h-2 w-full overflow-hidden rounded-full bg-muted",
				className,
			)}
			{...props}
		>
			<div
				data-slot="progress-indicator"
				className={cn(
					"h-full transition-[width] duration-300 ease-out",
					indicatorClassName ?? "bg-primary",
				)}
				style={{ width: `${v}%` }}
			/>
		</div>
	);
}

export { Progress };
