import { buttonVariants } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import {
  IconBrandNextjs,
  IconBrandSupabase,
  IconBrandTailwind,
  IconBrandTypescript,
  IconCircleChevronRight,
} from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';

const brands = [
  { href: 'https://nextjs.org', icon: <IconBrandNextjs />, label: 'Next.js' },
  {
    href: 'https://www.typescriptlang.org',
    icon: <IconBrandTypescript />,
    label: 'TypeScript',
  },
  {
    href: 'https://tailwindcss.com',
    icon: <IconBrandTailwind />,
    label: 'Tailwind CSS',
  },
  {
    href: 'https://supabase.com',
    icon: <IconBrandSupabase />,
    label: 'Supabase',
  },
];

export default async function Hero({
  teamId,
  projectId,
}: Readonly<{
  teamId: string;
  projectId: string;
}>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return (
    <section className="relative min-h-screen place-content-center overflow-hidden py-32">
      <div className="absolute inset-x-0 top-0 flex h-full w-full items-center justify-center opacity-100">
        <Image
          alt="background"
          src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/square-alt-grid.svg"
          className="[mask-image:radial-gradient(75%_75%_at_center,white,transparent)] opacity-90"
          fill
        />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="flex flex-col items-center gap-6">
            <div>
              <h1 className="scroll-m-20 text-center text-4xl font-medium tracking-tight text-balance">
                Effortless Integration Management{' '}
                <span className="text-primary">for Developers</span>
              </h1>
              <p className="max-w-3xl text-center leading-7 [&:not(:first-child)]:mt-6">
                Track, manage, and streamline all your project integrations and environment
                variables—right from one powerful dashboard.
              </p>
            </div>
            {data.user ? (
              <div className="flex justify-center gap-4">
                <Link href={`/dashboard/${teamId}/${projectId}`} className={buttonVariants()}>
                  Get to Dashboard <IconCircleChevronRight className="ml-2" />
                </Link>
                <Link href="#" className={buttonVariants({ variant: 'outline' })}>
                  Learn More
                </Link>
              </div>
            ) : (
              <div className="flex justify-center gap-4">
                <Link href="/auth/login" className={buttonVariants({ variant: 'outline' })}>
                  Sign In
                </Link>
                <Link href="/auth/sign-up" className={buttonVariants()}>
                  Sign Up
                </Link>
              </div>
            )}
            <div className="mt-12 flex flex-col items-center gap-5">
              <p className="text-muted-foreground text-xl">Built with open-source technologies</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {brands.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={buttonVariants({
                      variant: 'outline',
                      size: 'icon',
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
