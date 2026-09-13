import { planSchema, type Initiative, type Person, type Plan } from "./domain";
import type { CsvInspection, ImportKind } from "./csv";

function mergeRows(
  current: Person[] | Initiative[],
  incomingRows: CsvInspection["rows"],
  replace: boolean,
) {
  const incoming = new Set(incomingRows.map((r) => r?.id));
  const existing = new Set(current.map((r) => r.id));
  return {
    rows: [
      ...(replace ? [] : current.filter((r) => !incoming.has(r.id))),
      ...incomingRows,
    ],
    counts: {
      added: incomingRows.filter((r) => !existing.has(r?.id)).length,
      updated: incomingRows.filter((r) => existing.has(r?.id)).length,
      removed: replace ? current.filter((r) => !incoming.has(r.id)).length : 0,
    },
  };
}

function validationErrors(candidate: Plan) {
  const parsed = planSchema.safeParse(candidate);
  const errors = parsed.success
    ? []
    : [...new Set(parsed.error.issues.map((i) => i.message))];

  // Names never resolve identity. Flag inconsistent taxonomy labels for source correction.
  for (const [field, values] of [
    ["team", candidate.people.map((p) => p?.team)],
    ["business priority", candidate.initiatives.map((p) => p?.priority)],
  ] as const) {
    const labels = new Map<string, string>();
    for (const label of values) {
      if (typeof label !== "string" || !label) continue;
      const key = label.trim().toLowerCase().replace(/\s+/g, " ");
      const previous = labels.get(key);
      if (previous && previous !== label)
        errors.push(
          `Conflicting ${field} labels: “${previous}” and “${label}”. Use one exact label in the source data.`,
        );
      labels.set(key, label);
    }
  }

  try {
    if (
      new TextEncoder().encode(JSON.stringify(candidate)).byteLength > 2_000_000
    )
      errors.push(
        "Plan exceeds the 2,000,000-byte save limit. Reduce the imported data before saving.",
      );
  } catch {
    errors.push("Plan cannot be serialized. Review the imported rows.");
  }

  return [...new Set(errors)];
}

export function previewImport(
  plan: Plan,
  kind: ImportKind,
  inspection: CsvInspection,
  replace: boolean,
) {
  const merged = mergeRows(plan[kind], inspection.rows, replace);
  const candidate = { ...plan, [kind]: merged.rows } as Plan;
  return {
    plan: candidate,
    errors: validationErrors(candidate),
    ...merged.counts,
  };
}

export function previewWorkspaceImport(
  plan: Plan,
  inspections: { people: CsvInspection; initiatives: CsvInspection },
  replace: boolean,
) {
  const people = mergeRows(plan.people, inspections.people.rows, replace);
  const initiatives = mergeRows(
    plan.initiatives,
    inspections.initiatives.rows,
    replace,
  );
  const candidate = {
    ...plan,
    people: people.rows,
    initiatives: initiatives.rows,
  } as Plan;
  return {
    plan: candidate,
    errors: validationErrors(candidate),
    counts: { people: people.counts, initiatives: initiatives.counts },
  };
}
