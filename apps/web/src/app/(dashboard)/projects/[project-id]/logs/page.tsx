import { Button } from "@blenvi/ui/components/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LogsDataTable } from "@/components/features/project/logs-data-table";
import PageContainer from "@/components/layouts/page-container";
import { INTEGRATION_SERVICES, ROUTE_PATHS } from "@/constants";
import { getRecentChecksForProject } from "@/services/db/integration-checks";
import { getProjectById } from "@/services/db/projects";

const LOG_PAGE_SIZE = 25;

const serviceOptions = ["all", INTEGRATION_SERVICES.neon] as const;
const statusOptions = [
  "all",
  "healthy",
  "degraded",
  "down",
  "unknown",
] as const;

type ServiceFilter = (typeof serviceOptions)[number];
type StatusFilter = (typeof statusOptions)[number];

function nextQueryString(
  projectId: string,
  current: URLSearchParams,
  updates: Record<string, string | null>,
) {
  const params = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) params.delete(key);
    else params.set(key, value);
  }
  return `${ROUTE_PATHS.projectLogs(projectId)}?${params.toString()}`;
}

export default async function ProjectLogsPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ "project-id": string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const { "project-id": projectId } = await params;
  const resolved = (await searchParams) ?? {};

  const projectResult = await getProjectById(projectId);
  if (!projectResult.data) notFound();

  const projectName = projectResult.data.name;

  const pageParam = resolved.page;
  const serviceParam = resolved.service;
  const statusParam = resolved.status;

  const currentPage =
    typeof pageParam === "string" && Number(pageParam) > 0
      ? Number(pageParam)
      : 1;
  const selectedService: ServiceFilter =
    typeof serviceParam === "string" &&
    serviceOptions.includes(serviceParam as ServiceFilter)
      ? (serviceParam as ServiceFilter)
      : "all";
  const selectedStatus: StatusFilter =
    typeof statusParam === "string" &&
    statusOptions.includes(statusParam as StatusFilter)
      ? (statusParam as StatusFilter)
      : "all";

  const offset = (currentPage - 1) * LOG_PAGE_SIZE;
  const currentQuery = new URLSearchParams();
  if (selectedService !== "all") currentQuery.set("service", selectedService);
  if (selectedStatus !== "all") currentQuery.set("status", selectedStatus);
  currentQuery.set("page", String(currentPage));

  const checksResult = await getRecentChecksForProject(
    projectId,
    LOG_PAGE_SIZE + 1,
    {
      service: selectedService,
      status: selectedStatus,
      offset,
    },
  );

  const slice = checksResult.data ?? [];
  const hasNextPage = slice.length > LOG_PAGE_SIZE;
  const rows = hasNextPage ? slice.slice(0, LOG_PAGE_SIZE) : slice;

  return (
    <PageContainer
      pageTitle="Check logs"
      pageDescription={`Every poll for ${projectName} writes a row to integration_checks. Use filters to narrow by service or outcome.`}
      pageHeaderAction={
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTE_PATHS.project(projectId)}>Dashboard</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="rounded-xl border-[0.5px] border-border bg-background p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Filters
            </p>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">Service</span>
            <div className="flex flex-wrap gap-1.5">
              {serviceOptions.map((service) => (
                <Link
                  key={service}
                  href={nextQueryString(projectId, currentQuery, {
                    service: service === "all" ? null : service,
                    page: "1",
                  })}
                  className={`rounded-full border-[0.5px] px-2.5 py-0.5 text-xs ${
                    selectedService === service
                      ? "border-border bg-muted text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border"
                  }`}
                >
                  {service}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">Status</span>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((status) => (
                <Link
                  key={status}
                  href={nextQueryString(projectId, currentQuery, {
                    status: status === "all" ? null : status,
                    page: "1",
                  })}
                  className={`rounded-full border-[0.5px] px-2.5 py-0.5 text-xs ${
                    selectedStatus === status
                      ? "border-border bg-muted text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border"
                  }`}
                >
                  {status}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {checksResult.error ? (
          <p className="text-sm text-destructive">{checksResult.error}</p>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border-[0.5px] border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No checks match these filters. Adjust filters or wait for the next
            poll.
          </div>
        ) : (
          <LogsDataTable rows={rows} />
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Link
            href={nextQueryString(projectId, currentQuery, {
              page: String(Math.max(currentPage - 1, 1)),
            })}
            className={
              currentPage <= 1
                ? "pointer-events-none opacity-50"
                : "hover:text-foreground"
            }
          >
            Previous
          </Link>
          <span>Page {currentPage}</span>
          <Link
            href={nextQueryString(projectId, currentQuery, {
              page: String(currentPage + 1),
            })}
            className={
              hasNextPage
                ? "hover:text-foreground"
                : "pointer-events-none opacity-50"
            }
          >
            Next
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
