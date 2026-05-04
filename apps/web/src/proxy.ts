import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { ROUTE_PATHS } from "@/constants";
import { updateSession } from "@/lib/supabase/proxy";
import { getSupabaseConfig } from "./lib/supabase/config";

const PROTECTED_MATCHERS = [
  ROUTE_PATHS.overview,
  ROUTE_PATHS.projects,
  "/integrations",
  "/settings",
  "/changelog",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_MATCHERS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const { supabaseKey, supabaseUrl } = getSupabaseConfig();

  const authClient = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await authClient.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (!user && isProtectedPath(pathname)) {
    const url = new URL(ROUTE_PATHS.login, request.nextUrl);
    return NextResponse.redirect(url);
  }

  if (
    user &&
    (pathname === ROUTE_PATHS.login ||
      pathname === "/signup" ||
      pathname === "/sign-up")
  ) {
    const url = new URL(ROUTE_PATHS.overview, request.nextUrl);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/overview",
    "/projects/:path*",
    "/integrations",
    "/settings/:path*",
    "/changelog",
    "/login",
    "/signup",
    "/sign-up",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
