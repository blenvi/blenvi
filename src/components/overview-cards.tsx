import {
  IconFile,
  IconLink,
  IconMessageCircle,
  IconTerminal,
} from "@tabler/icons-react";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import Link from "next/link";

const data = [
  {
    id: 1,
    title: "Integration Setup Guide",
    description:
      "Step-by-step instructions to connect and configure your integrations, making setup and management easy.",
    actionText: "View Guide",
    actionUrl: "",
    actionIcon: IconLink,
  },
  {
    id: 2,
    title: "ENV Documentation",
    description:
      "Best practices and reference for managing your project’s environment variables securely and efficiently",
    actionText: "View Guide",
    actionUrl: "",
    actionIcon: IconFile,
  },
  {
    id: 3,
    title: "CLI Installation & Usage",
    description:
      "Learn how to install and use the Blenvi CLI to automate environment extraction and integration tracking.",
    actionText: "View Guide",
    actionUrl: "",
    actionIcon: IconTerminal,
  },
  {
    id: 4,
    title: "Support & Community",
    description:
      "Access FAQs, troubleshooting guides, and connect with other developers for help and best practices.",
    actionText: "View Guide",
    actionUrl: "",
    actionIcon: IconMessageCircle,
  },
];

export default function OverviewCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {data.map((item) => (
        <Card className="@container/card" key={item.id}>
          <CardHeader>
            <CardDescription>
              <item.actionIcon />
            </CardDescription>
            <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-xl">
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-4 text-sm h-full justify-between">
            <div className="font-medium">{item.description}</div>
            <Button size="sm" variant="outline" asChild className="mt-auto">
              <Link href={item.actionUrl}> View Guide</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
