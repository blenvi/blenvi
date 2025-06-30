import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ForgotPasswordFormSkeleton({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header section with logo and title */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md">
          <Skeleton className="size-10 rounded-md" />
        </div>
        <Skeleton className="h-7 w-32" />
        <div className="text-center text-sm">
          <Skeleton className="h-4 w-28 inline-block" />
          <span className="mx-1">
            <Skeleton className="h-4 w-12 inline-block" />
          </span>
        </div>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-6">
        {/* Email field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Submit button */}
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
