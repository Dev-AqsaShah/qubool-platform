import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasFullAccess } from "@/lib/access";

const PROTECTED_PREFIXES = ["/discover", "/profile", "/interests", "/matches", "/me", "/safety", "/membership", "/settings", "/onboarding", "/admin"];

// Routes a trial-expired, non-premium user can still reach (Section 8:
// "can log in; suggestions/chat limited" rather than locked out entirely).
const ALWAYS_ALLOWED_WHEN_EXPIRED = ["/me", "/safety", "/membership", "/settings", "/onboarding"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Supabase isn't configured yet (placeholder .env.local) — let public
  // pages like the landing page render instead of crashing, but still block
  // protected routes since auth can't be verified without it.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const path = request.nextUrl.pathname;
    if (PROTECTED_PREFIXES.some((p) => path.startsWith(p))) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (isProtected && user && !ALWAYS_ALLOWED_WHEN_EXPIRED.some((p) => path.startsWith(p))) {
    const { data: appUser } = await supabase
      .from("users")
      .select("trial_ends_at, premium_until")
      .eq("id", user.id)
      .maybeSingle();

    if (appUser && !hasFullAccess(appUser)) {
      const url = request.nextUrl.clone();
      url.pathname = "/membership";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
