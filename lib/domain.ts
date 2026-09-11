import { z } from "zod";
export const crafts = ["design", "research", "content", "design_eng"] as const;
export type Craft = (typeof crafts)[number];
export const labels: Record<Craft, string> = {
  design: "Design",
  research: "Research",
  content: "Content",
  design_eng: "Design engineering",
};
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v,
    "Invalid calendar date",
  );
export const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  craft: z.enum(crafts),
  title: z.string().trim().max(120).default(""),
  team: z.string().trim().max(120).default(""),
  managerId: z.string().nullable().default(null),
  isLeader: z.boolean().default(false),
  fte: z.number().min(0).max(1),
  nonProjectPct: z.number().min(0).max(100),
});
export const initiativeSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1),
    leadId: z.string().nullable().default(null),
    memberIds: z.array(z.string()).max(10000).default([]),
    dependsOn: z.array(z.string()).max(1000).default([]),
    importance: z.enum(["top", "high", "normal"]).default("normal"),
    health: z
      .enum(["not_reported", "on_track", "at_risk", "needs_decision"])
      .default("not_reported"),
    decision: z.string().trim().max(2000).default(""),
    update: z.string().trim().max(2000).default(""),
    priority: z.string().trim().max(120).default(""),
    owner: z.string().trim().max(120).default(""),
    summary: z.string().trim().max(2000).default(""),
    delivery: z
      .enum(["planned", "in_progress", "blocked", "completed"])
      .default("planned"),
    start: date,
    end: date,
    status: z.enum(["proposed", "committed", "stretch"]),
    effort: z.object({
      design: z.number().min(0).max(1000),
      research: z.number().min(0).max(1000),
      content: z.number().min(0).max(1000),
      design_eng: z.number().min(0).max(1000),
    }),
  })
  .refine((v) => v.end >= v.start, "End must follow start")
  .refine(
    (v) => Date.parse(v.end) - Date.parse(v.start) <= 366 * 86400000 * 5,
    "Date range must be at most five years",
  );
export type Person = z.infer<typeof personSchema>;
export type Initiative = z.infer<typeof initiativeSchema>;
export type CapacityPeriod = {
  craft: Craft;
  weekStart: string;
  availableFte: number;
};
export type Allocation = {
  initiativeId: string;
  craft: Craft;
  weekStart: string;
  fte: number;
};
export const planSchema = z
  .object({
    people: z.array(personSchema).max(10000),
    initiatives: z.array(initiativeSchema).max(10000),
    revision: z.number().int().nonnegative(),
  })
  .superRefine((v, ctx) => {
    for (const key of ["people", "initiatives"] as const)
      if (new Set(v[key].map((x) => x.id)).size !== v[key].length)
        ctx.addIssue({ code: "custom", message: `Duplicate ${key} IDs` });
    const people = new Map(v.people.map((p) => [p.id, p]));
    const projects = new Map(v.initiatives.map((p) => [p.id, p]));
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    for (const p of v.people) {
      if (p.managerId && !people.has(p.managerId))
        issue(`Unknown manager for ${p.name}`);
      const seen = new Set([p.id]);
      let next = p.managerId;
      while (next && people.has(next)) {
        if (seen.has(next)) {
          issue(`Reporting cycle involving ${p.name}`);
          break;
        }
        seen.add(next);
        next = people.get(next)!.managerId;
      }
    }
    for (const p of v.initiatives) {
      if (p.leadId && !people.has(p.leadId))
        issue(`Unknown project lead for ${p.name}`);
      if (p.memberIds.some((id) => !people.has(id)))
        issue(`Unknown contributor for ${p.name}`);
      if (new Set(p.memberIds).size !== p.memberIds.length)
        issue(`Duplicate contributors for ${p.name}`);
      if (p.dependsOn.some((id) => id === p.id || !projects.has(id)))
        issue(`Invalid project dependency for ${p.name}`);
      if (new Set(p.dependsOn).size !== p.dependsOn.length)
        issue(`Duplicate dependencies for ${p.name}`);
    }
  });
export type Plan = z.infer<typeof planSchema>;
