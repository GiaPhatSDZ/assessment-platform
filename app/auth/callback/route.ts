import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/src/infrastructure/database/supabase-server";
import { sanitizeRedirectUrl } from "@/src/infrastructure/auth/safe-redirect";
import { VISITOR_COOKIE_NAME } from "@/src/infrastructure/auth/anonymous-visitor";
import { assessmentRepository } from "@/src/infrastructure/database/supabase-assessment-repository";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next");
  const safeNext = sanitizeRedirectUrl(rawNext, "/dashboard");

  const redirectTarget = new URL(safeNext, requestUrl.origin);

  // 1. Mock / local development mode fallback
  if (code === "mock_dev_code" && !isSupabaseConfigured()) {
    const mockEmail = requestUrl.searchParams.get("email") || "dev@example.com";
    const mockUserId = "usr_mock_dev";

    await assessmentRepository.upsertUserProfile({
      id: mockUserId,
      email: mockEmail,
      displayName: mockEmail.split("@")[0],
    });

    const visitorToken = request.cookies.get(VISITOR_COOKIE_NAME)?.value;
    if (visitorToken) {
      await assessmentRepository.claimSessionsForUser(mockUserId, visitorToken);
    }

    const response = NextResponse.redirect(redirectTarget);
    response.cookies.set("mock_user_session", mockUserId, {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24,
    });
    return response;
  }

  if (!code) {
    const loginTarget = new URL("/login?error=missing_code", requestUrl.origin);
    return NextResponse.redirect(loginTarget);
  }

  if (!isSupabaseConfigured()) {
    const loginTarget = new URL("/login?error=supabase_not_configured", requestUrl.origin);
    return NextResponse.redirect(loginTarget);
  }

  // 2. Production Supabase code exchange with SSR cookie handling
  const response = NextResponse.redirect(redirectTarget);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    const failureTarget = new URL("/login?error=auth_failed", requestUrl.origin);
    return NextResponse.redirect(failureTarget);
  }

  const user = data.user;
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Học viên";

  // Upsert user profile
  await assessmentRepository.upsertUserProfile({
    id: user.id,
    email: user.email || "",
    displayName,
  });

  // Verify and claim sessions associated with the active anonymous visitor token
  const visitorToken = request.cookies.get(VISITOR_COOKIE_NAME)?.value;
  if (visitorToken) {
    await assessmentRepository.claimSessionsForUser(user.id, visitorToken);
  }

  return response;
}
