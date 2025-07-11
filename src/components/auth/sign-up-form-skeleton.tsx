import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function SignUpFormSkeleton({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header section with logo and title */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md">
          <Skeleton className="size-10 rounded-md" />
        </div>
        <Skeleton className="h-7 w-40" />
        <div className="text-center text-sm">
          <Skeleton className="inline-block h-4 w-36" />
          <span className="mx-1">
            <Skeleton className="inline-block h-4 w-12" />
          </span>
        </div>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-6">
        {/* First Name and Last Name - responsive grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Confirm Password field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Submit button */}
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Divider */}
      <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
        <span className="bg-background text-muted-foreground relative z-10 px-2">
          <Skeleton className="inline-block h-4 w-6" />
        </span>
      </div>

      {/* OAuth buttons */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
