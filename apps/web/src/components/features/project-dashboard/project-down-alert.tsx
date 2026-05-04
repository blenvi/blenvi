import { Card, CardContent } from "@blenvi/ui/components/card";
import { cn } from "@blenvi/ui/lib/utils";
import { AlertCircleIcon } from "lucide-react";

import { severitySurfaceClass, statusTextClass } from "@/lib/ui/status-styles";

export function ProjectDownAlert({ services }: { services: string[] }) {
  if (services.length === 0) return null;
  return (
    <Card
      className={cn(
        "gap-0 py-0 shadow-none ring-0",
        severitySurfaceClass.critical,
      )}
    >
      <CardContent className="py-3 sm:py-3.5">
        <div className="flex items-start gap-2">
          <AlertCircleIcon
            className={`mt-0.5 size-3.5 shrink-0 ${statusTextClass.down}`}
            aria-hidden
          />
          <p className={`text-sm font-normal ${statusTextClass.down}`}>
            Service{services.length === 1 ? "" : "s"} reporting down:{" "}
            {services.join(", ")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
