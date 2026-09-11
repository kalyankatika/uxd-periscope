import { readPlan } from "@/lib/db";
import Planner from "./planner";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default function Page() {
  return <Planner initial={readPlan()} />;
}
