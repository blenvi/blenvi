"use client";

import { Separator } from "@blenvi/ui/components/separator";
import { cn } from "@blenvi/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="field-group"
			className={cn(
				"@container/field-group flex flex-col gap-6 data-[slot=checkbox-group]:gap-3",
				className,
			)}
			{...props}
		/>
	);
}

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
	return (
		<fieldset
			data-slot="field-set"
			className={cn(
				"min-w-0 space-y-4 border-0 p-0 has-[>[data-slot=field-group]]:space-y-4",
				className,
			)}
			{...props}
		/>
	);
}

const fieldLegendVariants = cva("mb-0 font-medium text-foreground", {
	variants: {
		variant: {
			legend: "text-base",
			label: "text-sm",
		},
	},
	defaultVariants: {
		variant: "legend",
	},
});

function FieldLegend({
	className,
	variant,
	...props
}: React.ComponentProps<"legend"> & VariantProps<typeof fieldLegendVariants>) {
	return (
		<legend
			data-slot="field-legend"
			className={cn(fieldLegendVariants({ variant }), className)}
			{...props}
		/>
	);
}

function FieldSeparator({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="field-separator"
			className={cn("py-2", className)}
			{...props}
		>
			<Separator />
		</div>
	);
}

function Field({
	className,
	orientation = "vertical",
	...props
}: React.ComponentProps<"div"> & {
	orientation?: "vertical" | "horizontal" | "responsive";
}) {
	return (
		<div
			data-slot="field"
			data-orientation={orientation}
			className={cn(
				"group/field flex w-full gap-3",
				orientation === "vertical" && "flex-col [&>*]:w-full",
				orientation === "horizontal" && "flex-row items-center",
				orientation === "responsive" &&
					"flex-col @md/field-group:flex-row @md/field-group:items-center",
				className,
			)}
			{...props}
		/>
	);
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="field-content"
			className={cn(
				"group/field-content flex flex-1 flex-col gap-1.5 leading-snug",
				className,
			)}
			{...props}
		/>
	);
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
	return (
		<label
			data-slot="field-label"
			className={cn(
				"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="field-title"
			className={cn("text-sm font-medium text-foreground", className)}
			{...props}
		/>
	);
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="field-description"
			className={cn(
				"text-sm font-normal text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a]:hover:text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function FieldError({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			role="alert"
			data-slot="field-error"
			className={cn("text-sm font-normal text-destructive", className)}
			{...props}
		/>
	);
}

export {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
	FieldTitle,
};
