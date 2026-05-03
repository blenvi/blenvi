import { Button } from "@blenvi/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";
import Link from "next/link";

export default function MarketingPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-16">
      <section className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          Monitor all your SaaS integrations in one place.
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Blenvi gives solo developers and small teams a single dashboard for
          health, usage limits, and billing.
        </p>
        <Button asChild>
          <Link href="/login">Get started</Link>
        </Button>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Unified health</CardTitle>
          </CardHeader>
          <CardContent>
            Deep Neon Postgres monitoring: branches, storage, compute, and probe
            history from your Neon Console API.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usage visibility</CardTitle>
          </CardHeader>
          <CardContent>
            See plan limits and consumption per workspace and project.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Billing clarity</CardTitle>
          </CardHeader>
          <CardContent>
            Review billing signals in one dashboard before they become
            incidents.
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
