import { Button } from "@blenvi/ui/components/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@blenvi/ui/components/item";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";
import { formatRelative } from "@/components/features/dashboard/metric-format";
import { ROUTE_PATHS } from "@/constants";
import type { OverviewProjectSummary } from "@/types/database";

export function ProjectsListCard({
  projects,
}: {
  projects: OverviewProjectSummary[];
}) {
  return (
    <div>
      <CardHeader className="mb-4">
        <CardTitle>Projects</CardTitle>
        <CardDescription>
          Workspace projects and worst-case integration status
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
            <Link href={ROUTE_PATHS.projects}>All projects</Link>
          </Button>
        </CardAction>
      </CardHeader>
      {projects.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <p className="text-sm font-normal text-muted-foreground">
            No projects yet.
          </p>
          <Button asChild>
            <Link href={ROUTE_PATHS.newProject}>
              Create
              <PlusCircleIcon className="size-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <ItemGroup>
          {projects.map((project) => (
            <Item key={project.id} variant="outline">
              <ItemContent>
                <ItemTitle className="truncate">{project.name}</ItemTitle>
                <ItemDescription>
                  {project.integrationCount} integrations - checked{" "}
                  {project.lastChecked
                    ? formatRelative(project.lastChecked)
                    : "never"}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="outline" size="sm">
                  <Link href={ROUTE_PATHS.project(project.id)}>View</Link>
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}
    </div>
  );
}
