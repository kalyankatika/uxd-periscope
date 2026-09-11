import { planSchema, type Initiative, type Person, type Plan } from "./domain";
import type { CsvInspection, ImportKind } from "./csv";

export function previewImport(
  plan: Plan,
  kind: ImportKind,
  inspection: CsvInspection,
  replace: boolean,
) {
  const incoming = new Set(inspection.rows.map((r) => r.id));
  const existing = new Set(plan[kind].map((r) => r.id));
  const merged = [
    ...(replace ? [] : plan[kind].filter((r) => !incoming.has(r.id))),
    ...inspection.rows,
  ];
  const candidate = { ...plan, [kind]: merged } as Plan;
  const parsed = planSchema.safeParse(candidate);
  const errors = parsed.success
    ? []
    : [...new Set(parsed.error.issues.map((i) => i.message))];
  // Names never resolve identity. Flag inconsistent taxonomy labels for source correction.
  for (const [field, values] of [
    ["team", candidate.people.map((p: Person) => p.team)],
    [
      "business priority",
      candidate.initiatives.map((p: Initiative) => p.priority),
    ],
  ] as const) {
    const labels = new Map<string, string>();
    for (const label of values.filter(Boolean)) {
      const key = label.trim().toLowerCase().replace(/\s+/g, " ");
      const previous = labels.get(key);
      if (previous && previous !== label)
        errors.push(
          `Conflicting ${field} labels: “${previous}” and “${label}”. Use one exact label in the source data.`,
        );
      labels.set(key, label);
    }
  }
  return {
    plan: candidate,
    errors: [...new Set(errors)],
    added: inspection.rows.filter((r) => !existing.has(r.id)).length,
    updated: inspection.rows.filter((r) => existing.has(r.id)).length,
    removed: replace ? plan[kind].filter((r) => !incoming.has(r.id)).length : 0,
  };
}
