import { isRateLimited } from "@/lib/rateLimiter";
import { isSpam } from "@/lib/spamCheck";
import { enrichWithGeo } from "@/lib/geoEnrichment";
import { sendWebhookSafely } from "@/lib/safeWebhook";
import { createSubmission } from "@/repositories/submissionRepository";
import { findWidgetById } from "@/repositories/widgetRepository";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { widgetId, data } = body;

    // --- Validation at the boundary ---
    if (!widgetId || !data || typeof data !== "object") {
      return Response.json(
        { success: false, error: "widgetId and data are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const widget = await findWidgetById(widgetId);
    if (!widget) {
      return Response.json(
        { success: false, error: "Widget not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Reject oversized payloads
    const payloadSize = JSON.stringify(data).length;
    if (payloadSize > 5000) {
      return Response.json(
        { success: false, error: "Payload too large" },
        { status: 400, headers: corsHeaders }
      );
    }

    // --- Rate limiting (per IP + widget) ---
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitKey = `${ip}:${widgetId}`;
    const limited = await isRateLimited(rateLimitKey, { maxRequests: 5, windowSeconds: 60 });
    if (limited) {
      return Response.json(
        { success: false, error: "Too many submissions — please try again later" },
        { status: 429, headers: corsHeaders }
      );
    }

    // --- Spam check ---
    const spamResult = isSpam(data);

    // --- Enrichment (IP → geo, with fallback chain) ---
    const forceProvider1Down = request.headers.get("x-test-geo-provider-1-down") === "true";
const geo = await enrichWithGeo(ip, { forceProvider1Down });

    // --- Store the submission (even if spam-flagged — for the owner to review) ---
    const submission = await createSubmission({
      widgetId,
      data,
      ip,
      geo,
      spamFlagged: spamResult.spam,
    });

    // --- Safe side effect: webhook that can fail without failing the submission ---
    await sendWebhookSafely({ widgetId, submissionId: submission.id, data });

    return Response.json(
      { success: true, id: submission.id, spamFlagged: spamResult.spam },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Submission error:", error);
    return Response.json(
      { success: false, error: "Internal error" },
      { status: 500, headers: corsHeaders }
    );
  }
}