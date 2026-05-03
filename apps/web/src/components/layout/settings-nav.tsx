"use client";

import { cn } from "@blenvi/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/settings/account", label: "Account" },
  { href: "/settings/password", label: "Password" },
  { href: "/settings/workspace", label: "Workspace" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mb-8 flex flex-wrap gap-1 border-b border-border"
      aria-label="Settings sections"
    >
      {links.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/settings/account" &&
            pathname.startsWith(`${link.href}/`));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
