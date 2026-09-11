import { readPlan } from "@/lib/db";
import { workGraph } from "@/lib/work-graph";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export function GET() {
  return Response.json(workGraph(readPlan()), {
    headers: { "Content-Type": "application/ld+json" },
  });
}
