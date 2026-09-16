import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { assessmentRepository } from "@/src/infrastructure/database/supabase-assessment-repository";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/src/infrastructure/database/supabase-server";
import { VISITOR_COOKIE_NAME } from "@/src/infrastructure/auth/anonymous-visitor";

// In-memory lead store for test/offline environments
const memoryLeads = new Map<string, { displayName: string; email: string; consentProcessingAt: string; consentMarketingAt?: string }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, displayName, email, consentProcessing, consentMarketing } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    if (!displayName || typeof displayName !== "string" || displayName.trim().length === 0) {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!consentProcessing) {
      return NextResponse.json(
        { error: "Processing consent is required" },
        { status: 400 }
      );
    }

    // Verify session ownership
    let visitorToken = req.cookies.get(VISITOR_COOKIE_NAME)?.value;
    if (!visitorToken) {
      try {
        const cookieStore = await cookies();
        visitorToken = cookieStore.get(VISITOR_COOKIE_NAME)?.value;
      } catch {
        // Fallback in unit test environment
      }
    }

    // If visitorToken is provided, verify session ownership
    if (visitorToken) {
      const ownedSession = await assessmentRepository.loadOwnedSession(sessionId, visitorToken);
      if (!ownedSession) {
        return NextResponse.json({ error: "Unauthorized session ownership" }, { status: 403 });
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim();
    const processingTimestamp = new Date().toISOString();
    const marketingTimestamp = consentMarketing ? new Date().toISOString() : undefined;

    memoryLeads.set(sessionId, {
      displayName: cleanName,
      email: cleanEmail,
      consentProcessingAt: processingTimestamp,
      consentMarketingAt: marketingTimestamp,
    });

    if (isSupabaseAdminConfigured()) {
      try {
        const supabase = getSupabaseAdminClient()!;
        await supabase.from("leads").upsert(
          {
            session_id: sessionId,
            display_name: cleanName,
            email: cleanEmail,
            consent_processing_at: processingTimestamp,
            consent_marketing_at: marketingTimestamp || null,
          },
          { onConflict: "session_id" }
        );
      } catch (err) {
        console.warn("Failed to persist lead to Supabase; stored in memory store", err);
      }
    }

    return NextResponse.json({
      success: true,
      sessionId,
      message: "Lead information saved successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to capture lead" },
      { status: 500 }
    );
  }
}
