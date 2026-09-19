import { NextRequest, NextResponse } from "next/server";
import { ServerDiagnosticService } from "@/src/application/diagnostic/server-diagnostic-service";
import {
  AttemptAlreadyRecordedError,
  ContentNotPublishedError,
  InvalidCanonicalGradingItemError,
  InvalidGradingInputError,
  SessionClosedError,
  SessionCompatibilityError,
  StateConflictRetryError,
  UnsupportedGradingRuleError,
} from "@/src/domain/diagnostic/types";
import {
  UnauthorizedLearnerAccessError,
} from "@/src/domain/learning-persistence/types";
import { VISITOR_COOKIE_NAME } from "@/src/infrastructure/auth/anonymous-visitor";
import { getAuthenticatedUser } from "@/src/infrastructure/auth/supabase-ssr";

/**
 * Validates that the request origin matches the host header to prevent CSRF / cross-origin POST attacks (A7).
 */
function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) {
    // Same-origin browser requests or non-browser server requests without Origin header
    return true;
  }

  const host = req.headers.get("host");
  if (!host) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // A7: Reject cross-origin POST
  if (!isAllowedOrigin(req)) {
    return NextResponse.json(
      { error: "CROSS_ORIGIN_FORBIDDEN: Cross-origin submissions are rejected.", code: "CROSS_ORIGIN_FORBIDDEN" },
      { status: 403 }
    );
  }

  // A7: Derive visitorToken ONLY from HttpOnly cookie (do NOT auto-create)
  const visitorToken = req.cookies.get(VISITOR_COOKIE_NAME)?.value;

  // A7: Derive userId ONLY from trusted Supabase SSR getAuthenticatedUser()
  let userId: string | undefined;
  try {
    const user = await getAuthenticatedUser();
    if (user?.id) {
      userId = user.id;
    }
  } catch {
    // Auth client unavailable or unconfigured
  }

  if (!visitorToken && !userId) {
    return NextResponse.json(
      { error: "UNAUTHORIZED: Valid visitor session or authenticated user required.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON: Failed to parse request body as JSON.", code: "INVALID_JSON" },
      { status: 400 }
    );
  }

  try {
    const service = new ServerDiagnosticService();
    const result = await service.submitAttempt(body, { visitorToken, userId });
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof UnauthorizedLearnerAccessError) {
      return NextResponse.json(
        { error: err.message, code: "UNAUTHORIZED_LEARNER_ACCESS" },
        { status: 403 }
      );
    }
    if (err instanceof AttemptAlreadyRecordedError) {
      return NextResponse.json(
        { error: err.message, code: "ATTEMPT_ALREADY_RECORDED" },
        { status: 409 }
      );
    }
    if (err instanceof SessionClosedError) {
      return NextResponse.json(
        { error: err.message, code: "SESSION_CLOSED" },
        { status: 409 }
      );
    }
    if (err instanceof StateConflictRetryError) {
      return NextResponse.json(
        { error: err.message, code: "STATE_CONFLICT_RETRY" },
        { status: 409 }
      );
    }
    if (err instanceof SessionCompatibilityError) {
      return NextResponse.json(
        { error: err.message, code: "SESSION_COMPATIBILITY_ERROR" },
        { status: 400 }
      );
    }
    if (err instanceof InvalidGradingInputError) {
      return NextResponse.json(
        { error: err.message, code: "INVALID_GRADING_INPUT" },
        { status: 400 }
      );
    }
    if (err instanceof UnsupportedGradingRuleError) {
      return NextResponse.json(
        { error: err.message, code: "UNSUPPORTED_GRADING_RULE" },
        { status: 422 }
      );
    }
    if (err instanceof ContentNotPublishedError) {
      return NextResponse.json(
        { error: err.message, code: "CONTENT_NOT_AVAILABLE" },
        { status: 422 }
      );
    }
    if (err instanceof InvalidCanonicalGradingItemError) {
      return NextResponse.json(
        { error: "INVALID_CANONICAL_GRADING_ITEM: Server curriculum item configuration is invalid.", code: "INVALID_CANONICAL_GRADING_ITEM" },
        { status: 500 }
      );
    }

    // Generic error to prevent database/internal leakage
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR: An error occurred processing the diagnostic submission.", code: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
