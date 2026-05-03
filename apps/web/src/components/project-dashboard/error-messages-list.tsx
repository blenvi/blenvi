"use client";

import { Badge } from "@blenvi/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
} from "@blenvi/ui/components/item";

import type { ErrorSnippet } from "@/lib/db/integration-analytics";

type Props = {
  errors: ErrorSnippet[];
};

export function ErrorMessagesList({ errors }: Props) {
  return (
    <Card>
      <CardHeader className="border-b border-border [.border-b]:pb-4">
        <CardTitle>Top error messages (7d)</CardTitle>
        <CardDescription>
          Most frequent failure strings from checks
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {errors.length === 0 ? (
          <p className="text-sm font-normal italic text-muted-foreground">
            No errors recorded in the past 7 days.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {errors.map((err) => (
              <Item
                key={`${err.message}::${err.count}`}
                variant="outline"
                size="sm"
                aria-label={`${err.count} times: ${err.message}`}
              >
                <ItemMedia>
                  <Badge variant="secondary" className="tabular-nums">
                    ×{err.count}
                  </Badge>
                </ItemMedia>
                <ItemContent>
                  <ItemDescription className="font-mono text-xs leading-snug">
                    {err.message}
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
