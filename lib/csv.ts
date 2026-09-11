import Papa from "papaparse";
import {
  crafts,
  personSchema,
  initiativeSchema,
  type Person,
  type Initiative,
} from "./domain";
export type ImportKind = "people" | "initiatives";
export type CsvInspection = {
  rows: Person[] | Initiative[];
  columns: { source: string; target: string }[];
  ignored: string[];
  conversions: { field: string; from: string; to: string }[];
};
export const csvFieldLabels: Record<string, string> = {
  id: "Record ID",
  name: "Name",
  craft: "Discipline",
  fte: "Working time (FTE)",
  nonProjectPct: "Non-project time (%)",
  title: "Job title",
  team: "Team",
  managerId: "Manager ID",
  isLeader: "Leader",
  start: "Start date",
  end: "End date",
  status: "Commitment",
  leadId: "Project owner ID",
  memberIds: "Contributor IDs",
  dependsOn: "Dependency IDs",
  importance: "Importance",
  health: "Project health",
  decision: "Action required",
  update: "Latest update",
  priority: "Business priority",
  owner: "Legacy owner name",
  summary: "Expected outcome",
  delivery: "Delivery status",
  design: "Design effort",
  research: "Research effort",
  content: "Content effort",
  design_eng: "Design engineering effort",
};
const token = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
const personFields = [
  "id",
  "name",
  "craft",
  "fte",
  "nonProjectPct",
  "title",
  "team",
  "managerId",
  "isLeader",
];
const projectFields = [
  "id",
  "name",
  "start",
  "end",
  "status",
  ...crafts,
  "leadId",
  "memberIds",
  "dependsOn",
  "importance",
  "health",
  "decision",
  "update",
  "priority",
  "owner",
  "summary",
  "delivery",
];
const headerAliases: Record<ImportKind, Record<string, string>> = {
  people: {
    employeeid: "id",
    personid: "id",
    fullname: "name",
    employeename: "name",
    discipline: "craft",
    workingtimefte: "fte",
    nonprojecttime: "nonProjectPct",
    nonprojecttimepercent: "nonProjectPct",
    jobtitle: "title",
    department: "team",
    reportstoid: "managerId",
    leader: "isLeader",
  },
  initiatives: {
    projectid: "id",
    projectname: "name",
    startdate: "start",
    enddate: "end",
    commitment: "status",
    projectownerid: "leadId",
    ownerid: "leadId",
    contributorids: "memberIds",
    dependencyids: "dependsOn",
    projecthealth: "health",
    actionrequired: "decision",
    latestupdate: "update",
    businesspriority: "priority",
    expectedoutcome: "summary",
    deliverystatus: "delivery",
    designeffort: "design",
    researcheffort: "research",
    contenteffort: "content",
    designengineeringeffort: "design_eng",
  },
};
const valueAliases: Record<string, Record<string, string>> = {
  craft: {
    design: "design",
    productdesign: "design",
    uxdesign: "design",
    research: "research",
    uxresearch: "research",
    content: "content",
    contentdesign: "content",
    designeng: "design_eng",
    designengineering: "design_eng",
  },
  status: {
    committed: "committed",
    proposed: "proposed",
    stretch: "stretch",
    backlog: "stretch",
  },
  health: {
    notreported: "not_reported",
    noupdateyet: "not_reported",
    ontrack: "on_track",
    atrisk: "at_risk",
    watchclosely: "at_risk",
    needsdecision: "needs_decision",
    needsadecision: "needs_decision",
    decisionrequired: "needs_decision",
  },
  delivery: {
    planned: "planned",
    inprogress: "in_progress",
    blocked: "blocked",
    completed: "completed",
  },
  importance: {
    top: "top",
    toppriority: "top",
    high: "high",
    highpriority: "high",
    normal: "normal",
    standard: "normal",
  },
};

export function inspectCsv(kind: ImportKind, text: string): CsvInspection {
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: "greedy" });
  if (parsed.errors.length) throw new Error(parsed.errors[0].message);
  const headers =
    parsed.data[0]?.map((h) => h.replace(/^\uFEFF/, "").trim()) || [];
  const fields = kind === "people" ? personFields : projectFields;
  const aliases = {
    ...Object.fromEntries(fields.map((f) => [token(f), f])),
    ...Object.fromEntries(fields.map((f) => [token(csvFieldLabels[f]), f])),
    ...headerAliases[kind],
  };
  const columns = headers.map((source) => ({
    source,
    target: aliases[token(source)] || "",
  }));
  const mapped = columns.filter((c) => c.target);
  if (new Set(mapped.map((c) => c.target)).size !== mapped.length)
    throw new Error(
      "Multiple columns map to the same field. Keep one source column per field.",
    );
  const required =
    kind === "people"
      ? ["id", "name", "craft", "fte", "nonProjectPct"]
      : ["id", "name", "start", "end", "status", ...crafts];
  const missing = required.filter(
    (field) => !mapped.some((c) => c.target === field),
  );
  if (missing.length)
    throw new Error(
      "Required columns: " + missing.map((f) => csvFieldLabels[f]).join(", "),
    );
  if (parsed.data.length < 2) throw new Error("CSV has no data rows");
  const conversions = new Map<
    string,
    { field: string; from: string; to: string }
  >();
  const rows = parsed.data.slice(1).map((values, index) => {
    if (values.length !== headers.length)
      throw new Error(
        `Row ${index + 2}: Expected ${headers.length} columns, received ${values.length}.`,
      );
    const r: Record<string, string> = {};
    columns.forEach((c, i) => {
      if (c.target) r[c.target] = values[i].trim();
    });
    for (const [field, options] of Object.entries(valueAliases)) {
      const from = r[field];
      if (!from) continue;
      const to = options[token(from)];
      if (!to)
        throw new Error(
          `Row ${index + 2}: Unrecognized ${csvFieldLabels[field]} label “${from}”. Use a supported value from the sample CSV.`,
        );
      r[field] = to;
      if (from !== to) conversions.set(`${field}:${from}`, { field, from, to });
    }
    if (r.isLeader) {
      const from = r.isLeader,
        key = token(from);
      if (!["true", "false", "yes", "no", "1", "0"].includes(key))
        throw new Error(
          `Row ${index + 2}: Leader must be true/false, yes/no, or 1/0.`,
        );
      r.isLeader = ["true", "yes", "1"].includes(key) ? "true" : "false";
      if (from !== r.isLeader)
        conversions.set(`isLeader:${from}`, {
          field: "isLeader",
          from,
          to: r.isLeader,
        });
    }
    const number = (key: string) => (r[key] ? Number(r[key]) : NaN);
    const list = (key: string) =>
      (r[key] || "")
        .split("|")
        .map((id) => id.trim())
        .filter(Boolean);
    const value =
      kind === "people"
        ? {
            id: r.id,
            name: r.name,
            craft: r.craft,
            title: r.title || "",
            team: r.team || "",
            managerId: r.managerId || null,
            isLeader: r.isLeader === "true",
            fte: number("fte"),
            nonProjectPct: number("nonProjectPct"),
          }
        : {
            id: r.id,
            name: r.name,
            start: r.start,
            end: r.end,
            status: r.status,
            leadId: r.leadId || null,
            memberIds: list("memberIds"),
            dependsOn: list("dependsOn"),
            importance: r.importance || "normal",
            health: r.health || "not_reported",
            decision: r.decision || "",
            update: r.update || "",
            priority: r.priority || "",
            owner: r.owner || "",
            summary: r.summary || "",
            delivery: r.delivery || "planned",
            effort: Object.fromEntries(crafts.map((c) => [c, number(c)])),
          };
    const result = (
      kind === "people" ? personSchema : initiativeSchema
    ).safeParse(value);
    if (!result.success)
      throw new Error(
        `Row ${index + 2}: ${result.error.issues.map((x) => x.path.join(".") + " " + x.message).join("; ")}`,
      );
    return result.data;
  });
  if (new Set(rows.map((r) => r.id)).size !== rows.length)
    throw new Error("Duplicate IDs in CSV");
  return {
    rows: rows as Person[] | Initiative[],
    columns: mapped,
    ignored: columns.filter((c) => !c.target).map((c) => c.source),
    conversions: [...conversions.values()],
  };
}

export function importCsv(kind: "people", text: string): Person[];
export function importCsv(kind: "initiatives", text: string): Initiative[];
export function importCsv(
  kind: ImportKind,
  text: string,
): Person[] | Initiative[] {
  return inspectCsv(kind, text).rows;
}
export function exportCsv(rows: object[]) {
  return Papa.unparse(
    rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.join("|") : v,
        ]),
      ),
    ),
    { escapeFormulae: true },
  );
}
