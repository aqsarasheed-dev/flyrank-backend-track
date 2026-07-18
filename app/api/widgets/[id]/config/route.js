import { findWidgetById } from "@/repositories/widgetRepository";

export async function GET(request, { params }) {
  const { id } = await params;
  const widget = await findWidgetById(id);

  if (!widget) {
    return Response.json({ error: "Widget not found" }, { status: 404 });
  }

  // Minimal payload — only what the embed script actually needs to render
  const config = {
    id: widget.id,
    type: widget.type,
    copy: widget.copy,
    fields: widget.fields,
    targeting: widget.targeting,
    version: widget.version,
  };

  return Response.json(config, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // public, cross-origin by design
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=60",
      "ETag": `"widget-${widget.id}-v${widget.version}"`,
    },
  });
}