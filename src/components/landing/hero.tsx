import { Button, buttonVariants } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  IconBrandNextjs,
  IconBrandSupabase,
  IconBrandTailwind,
  IconBrandTypescript,
  IconCircleChevronRight,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

const brands = [
  { href: "#", icon: <IconBrandNextjs />, label: "Next.js" },
  { href: "#", icon: <IconBrandTypescript />, label: "TypeScript" },
  { href: "#", icon: <IconBrandTailwind />, label: "Tailwind CSS" },
  { href: "#", icon: <IconBrandSupabase />, label: "Supabase" },
];

export default function Hero({
  teamId,
  projectId,
}: Readonly<{
  teamId: string;
  projectId: string;
}>) {
  return (
    <section className="relative overflow-hidden py-32 min-h-screen place-content-center">
      <div className="absolute inset-x-0 top-0 flex h-full w-full items-center justify-center opacity-100">
        <Image
          alt="background"
          src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/square-alt-grid.svg"
          className="[mask-image:radial-gradient(75%_75%_at_center,white,transparent)] opacity-90"
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="relative z-10 max-w-7xl px-6 lg:px-8 mx-auto">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="flex flex-col items-center gap-6">
            <div>
              <h1 className="scroll-m-20 text-center text-4xl font-medium tracking-tight text-balance">
                Effortless Integration Management{" "}
                <span className="text-primary">for Developers</span>
              </h1>
              <p className="leading-7 [&:not(:first-child)]:mt-6 max-w-3xl text-center">
                Track, manage, and streamline all your project integrations and
                environment variables—right from one powerful dashboard.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <SignedIn>
                <Link
                  href={`/dashboard/${teamId}/${projectId}`}
                  className={buttonVariants()}
                >
                  Get to Dashboard <IconCircleChevronRight className="ml-2" />
                </Link>
                <Link
                  href="#"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Learn More
                </Link>
              </SignedIn>
              <SignedOut>
                <Button variant="outline" asChild>
                  <SignInButton>Sign In</SignInButton>
                </Button>
                <Button asChild>
                  <SignUpButton>Sign Up</SignUpButton>
                </Button>
              </SignedOut>
            </div>
            <div className="mt-12 flex flex-col items-center gap-5">
              <p className="text-muted-foreground text-xl">
                Built with open-source technologies
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {brands.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={buttonVariants({
                      variant: "outline",
                      size: "icon",
                    })}
                  >
                    {item.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
