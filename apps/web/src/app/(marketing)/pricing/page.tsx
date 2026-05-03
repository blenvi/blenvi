import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";

const tiers = [
  {
    name: "Free",
    price: "$0",
    text: "1 workspace, 3 projects, community support",
  },
  {
    name: "Pro",
    price: "$12",
    text: "Unlimited projects, alerts, logs, priority support",
  },
  {
    name: "Team",
    price: "$29",
    text: "Team features, shared ownership, advanced controls",
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-semibold">Pricing</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.name}>
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{tier.price}</p>
              <p className="mt-2 text-sm text-muted-foreground">{tier.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
