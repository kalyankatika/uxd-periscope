import { z } from "zod";
import { planSchema } from "./domain";

export const staticSourceSchema = z.object({
  dataUrl: z.string().min(1),
  label: z.string().min(1),
  fictional: z.boolean().default(false),
  sourceUpdatedAt: z.string().datetime({ offset: true }).optional(),
});
export type StaticSource = z.infer<typeof staticSourceSchema>;

export function resolveDataUrl(config: StaticSource, configUrl: string) {
  const url = new URL(config.dataUrl, configUrl);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Data source must use HTTP or HTTPS.");
  if (url.username || url.password)
    throw new Error("Do not include credentials in the data source URL.");
  return url.href;
}
export function parseStaticPlan(value: unknown) {
  const result = planSchema.safeParse(value);
  if (!result.success) {
    const detail = result.error.issues.slice(0, 3).map(issue => issue.message).join("; ");
    throw new Error("Invalid workspace data: " + detail);
  }
  return result.data;
}
