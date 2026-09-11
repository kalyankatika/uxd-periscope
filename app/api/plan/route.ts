import { readPlan, savePlan } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json(readPlan());
}
export async function PUT(req: Request) {
  // Next may normalize req.url to localhost. Host preserves the browser-facing authority.
  const url = new URL(req.url);
  const expectedOrigin = `${url.protocol}//${req.headers.get("host") || url.host}`;
  if (req.headers.get("origin") !== expectedOrigin)
    return Response.json({ error: "Origin not allowed" }, { status: 403 });
  if (Number(req.headers.get("content-length") || 0) > 2_000_000)
    return Response.json({ error: "Plan too large" }, { status: 413 });
  try {
    const text = await req.text();
    if (text.length > 2_000_000)
      return Response.json({ error: "Plan too large" }, { status: 413 });
    return Response.json(savePlan(JSON.parse(text)));
  } catch (e) {
    const conflict = e instanceof Error && e.message === "CONFLICT";
    return Response.json(
      {
        error: conflict
          ? "The plan changed in another session. Reload before saving."
          : "Invalid plan. Check dates, effort, and people values.",
      },
      { status: conflict ? 409 : 400 },
    );
  }
}
