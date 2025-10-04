import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If there's no session and the user is trying to access the dashboard, redirect to the login page
  if (
    !session &&
    (req.nextUrl.pathname.startsWith("/?tab=dashboard") ||
      (req.nextUrl.pathname.startsWith("/dashboard") &&
        !req.nextUrl.pathname.startsWith("/dashboard/login")))
  ) {
    return NextResponse.redirect(new URL("/dashboard/login", req.url));
  }

  return res;
}
