"use client";

import { Badge } from "@blenvi/ui/components/badge";
import { Button } from "@blenvi/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";
import { Input } from "@blenvi/ui/components/input";
import {
  ActivityIcon,
  ChevronRightIcon,
  DatabaseZapIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  deleteIntegrationAction,
  getIntegrationsAction,
} from "@/actions/integrations";
import { ConnectNeonSheet } from "@/app/(dashboard)/projects/[project-id]/integrations/_components/connect-neon-sheet";
import PageContainer from "@/components/layout/page-container";
import { neonIntegrationSectionPath } from "@/lib/navigation/neon-integration-nav";
import type { Integration } from "@/types/database";

type Props = {
  projectId: string;
  projectName: string;
  initialIntegrations: Integration[];
};

type PollMode = "soft" | "hard";

type CatalogIntegration = {
  key:
    | Integration["service"]
    | "clerk"
    | "stripe"
    | "supabase"
    | "sanity"
    | "upstash";
  name: string;
  initials: string;
  category: "database" | "auth" | "billing" | "content" | "cache";
  description: string;
  enabled: boolean;
};

const CATALOG: CatalogIntegration[] = [
  {
    key: "neon",
    name: "Neon",
    initials: "NE",
    category: "database",
    description: "Monitor Postgres health, branches, operations, and usage.",
    enabled: true,
  },
  {
    key: "supabase",
    name: "Supabase",
    initials: "SB",
    category: "database",
    description: "Track database, auth, storage, and edge function health.",
    enabled: false,
  },
  {
    key: "clerk",
    name: "Clerk",
    initials: "CK",
    category: "auth",
    description: "Watch auth availability, user activity, and limits.",
    enabled: false,
  },
  {
    key: "stripe",
    name: "Stripe",
    initials: "ST",
    category: "billing",
    description: "Follow billing health, webhooks, and subscription events.",
    enabled: false,
  },
  {
    key: "sanity",
    name: "Sanity",
    initials: "SY",
    category: "content",
    description: "Monitor content API availability and dataset usage.",
    enabled: false,
  },
  {
    key: "upstash",
    name: "Upstash",
    initials: "UP",
    category: "cache",
    description: "Check Redis, Kafka, rate limits, and request volume.",
    enabled: false,
  },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "connected", label: "Connected" },
  { key: "database", label: "Database" },
  { key: "auth", label: "Auth" },
  { key: "billing", label: "Billing" },
  { key: "content", label: "Content" },
  { key: "cache", label: "Cache" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const STATUS_VARIANT: Record<
  Integration["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  healthy: "default",
  degraded: "secondary",
  down: "destructive",
  unknown: "outline",
};

export function ProjectIntegrationsClient({
  projectId,
  projectName,
  initialIntegrations,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Integration[]>(initialIntegrations);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activePollMode, setActivePollMode] = useState<PollMode | null>(null);

  const connectedByService = useMemo(
    () => new Map(items.map((item) => [item.service, item])),
    [items],
  );
  const neonIntegration = connectedByService.get("neon") ?? null;
  const neonOverviewHref = neonIntegrationSectionPath(projectId, "overview");
  const connectedCount = items.length;
  const availableCount = Math.max(0, CATALOG.length - connectedCount);

  const visibleIntegrations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return CATALOG.filter((integration) => {
      const connected =
        integration.key === "neon" && connectedByService.has("neon");
      if (filter === "connected" && !connected) return false;
      if (
        filter !== "all" &&
        filter !== "connected" &&
        integration.category !== filter
      ) {
        return false;
      }
      if (!normalizedQuery) return true;
      return (
        integration.name.toLowerCase().includes(normalizedQuery) ||
        integration.category.toLowerCase().includes(normalizedQuery) ||
        integration.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [connectedByService, filter, query]);

  async function loadIntegrations() {
    const result = await getIntegrationsAction(projectId);
    if (result.error) {
      setError(result.error);
      return;
    }
    setItems(result.data ?? []);
  }

  async function runPoll(integrationId: string, mode: PollMode) {
    setActivePollMode(mode);
    setError(null);
    const response = await fetch(`/api/integrations/${integrationId}/poll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(
        body.error ??
          (mode === "hard"
            ? "Hard refresh failed. Try again later."
            : "Soft check failed. Try again later."),
      );
    }
    await loadIntegrations();
    router.refresh();
    setActivePollMode(null);
  }

  return (
    <PageContainer
      pageTitle="Integrations"
      pageDescription={`${connectedCount} connected - ${availableCount} more available for ${projectName}`}
      pageHeaderAction={
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={`/projects/${projectId}`}>Back to dashboard</Link>
        </Button>
      }
    >
      <div className="space-y-5">
        <ConnectNeonSheet
          projectId={projectId}
          open={sheetOpen}
          isConnecting={isConnecting}
          onOpenChange={setSheetOpen}
          onConnectingChange={setIsConnecting}
          onError={setError}
          onCreated={async (created) => {
            setItems((current) => [
              created,
              ...current.filter((item) => item.service !== created.service),
            ]);
            await runPoll(created.id, "hard");
            router.push(neonOverviewHref);
          }}
        />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find an integration"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <Button
                key={item.key}
                type="button"
                variant={filter === item.key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-2 @6xl/main:grid-cols-3">
          {visibleIntegrations.map((catalogItem) => {
            const connected =
              catalogItem.key === "neon" ? neonIntegration : null;
            return (
              <Card key={catalogItem.key} className="@container/card">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground">
                      {catalogItem.initials}
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {connected ? (
                        <Badge variant={STATUS_VARIANT[connected.status]}>
                          {connected.status}
                        </Badge>
                      ) : null}
                      {!catalogItem.enabled ? (
                        <Badge variant="outline">Soon</Badge>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <CardTitle>{catalogItem.name}</CardTitle>
                    <p className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
                      {catalogItem.category}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="min-h-10 text-sm text-muted-foreground">
                    {catalogItem.description}
                  </p>

                  {connected ? (
                    <div className="mt-auto flex flex-col gap-2">
                      <Button asChild>
                        <Link href={neonOverviewHref}>
                          Open dashboard
                          <ChevronRightIcon className="size-3.5" />
                        </Link>
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={activePollMode !== null}
                          onClick={() => runPoll(connected.id, "soft")}
                        >
                          <ActivityIcon className="size-3.5" />
                          {activePollMode === "soft" ? "Checking..." : "Soft"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={activePollMode !== null}
                          onClick={() => runPoll(connected.id, "hard")}
                        >
                          <DatabaseZapIcon className="size-3.5" />
                          {activePollMode === "hard" ? "Syncing..." : "Hard"}
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={activePollMode !== null}
                        onClick={async () => {
                          const result = await deleteIntegrationAction(
                            connected.id,
                            projectId,
                          );
                          if (result.error) {
                            setError(result.error);
                            return;
                          }
                          setItems((current) =>
                            current.filter((item) => item.id !== connected.id),
                          );
                          router.refresh();
                        }}
                      >
                        <Trash2Icon className="size-3.5" />
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      className="mt-auto"
                      disabled={!catalogItem.enabled}
                      onClick={() => {
                        if (catalogItem.key === "neon") {
                          setSheetOpen(true);
                        }
                      }}
                    >
                      {catalogItem.enabled ? "Connect" : "Coming soon"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {visibleIntegrations.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              No integrations match your filters.
            </CardContent>
          </Card>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </PageContainer>
  );
}
