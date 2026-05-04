import { cn } from "@blenvi/ui/lib/utils";
import PageContainer from "@/components/layouts/page-container";

const changelogs = [
  {
    version: "0.2.0",
    date: "2026-05-04",
    title: "Neon workspace foundation",
    description:
      "Stabilized the workspace and project model, added Neon as the first supported provider, and moved Neon detail views into dedicated pages.",
    changes: [
      "Workspace-aware project switching and route synchronization",
      "Neon overview, branches, consumption, and operations pages",
      "Soft health polling for scheduled checks and hard refreshes for full Neon snapshots",
      "Integration catalog UI with connected and coming-soon provider states",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-02-01",
    title: "Initial Blenvi dashboard scaffold",
    description:
      "Introduced the dashboard shell, authentication flow, workspace setup, and early monitoring surfaces for integration health.",
    changes: [
      "Dashboard layout with workspace and project navigation",
      "Authentication pages and account settings",
      "Initial health, logs, alerts, and usage screens",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <PageContainer
      pageTitle="Changelog"
      pageDescription="Notable changes to the Blenvi dashboard."
    >
      <div className="flex flex-col divide-y sm:mt-6 sm:divide-y-0">
        {changelogs.map((changelog, index) => (
          <div
            className="relative flex items-start gap-8 py-8 sm:border-l sm:first:pt-0"
            key={changelog.version}
          >
            <div className="sticky top-5 mt-1.5 hidden min-w-40 pl-8 text-lg text-muted-foreground tracking-tight sm:block">
              <p className="relative z-10 bg-background pl-3 text-base leading-none">
                {changelog.date}
              </p>
              <div
                className={cn(
                  "absolute inset-y-0 left-0 my-auto h-2 w-2 -translate-x-1/2 rounded-full bg-muted-foreground",
                  index === 0 && "bg-primary ring-[3px] ring-primary/30",
                )}
              />
              <div className="absolute inset-0 -z-10 my-auto h-px w-full bg-border" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {changelog.version}
                </p>
                <h2 className="font-medium text-2xl tracking-tight">
                  {changelog.title}
                </h2>
                <span className="mt-2 block text-sm text-muted-foreground sm:hidden">
                  {changelog.date}
                </span>
              </div>
              <p className="text-muted-foreground">{changelog.description}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {changelog.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
