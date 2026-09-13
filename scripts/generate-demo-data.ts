import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";
import { csvFieldLabels } from "../lib/csv";
import { labels, type Initiative } from "../lib/domain";
import { leadershipDemo } from "../lib/leadership-demo";

const commitment: Record<Initiative["status"], string> = {
  committed: "Committed",
  proposed: "Proposed",
  stretch: "Backlog",
};
const importance: Record<Initiative["importance"], string> = {
  top: "Top priority",
  high: "High priority",
  normal: "Standard",
};
const health: Record<Initiative["health"], string> = {
  not_reported: "Not reported",
  on_track: "On track",
  at_risk: "At risk",
  needs_decision: "Needs decision",
};
const delivery: Record<Initiative["delivery"], string> = {
  planned: "Planned",
  in_progress: "In progress",
  blocked: "Blocked",
  completed: "Completed",
};

function csv(rows: Record<string, unknown>[]) {
  return (
    Papa.unparse(
      rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([field, value]) => [
            csvFieldLabels[field],
            Array.isArray(value) ? value.join("|") : value,
          ]),
        ),
      ),
      { newline: "\n", escapeFormulae: true },
    ) + "\n"
  );
}

/** Portable fixtures come only from the fictional example, never the saved database. */
export function buildDemoFiles() {
  const plan = leadershipDemo();
  const functionalLeaders = plan.people.filter(
    (person) => person.isLeader && person.managerId === "uxd-head",
  );
  const manifest = {
    dataset: "Periscope UXD demo",
    datasetVersion: 1,
    fictional: true,
    description:
      "Fictional people, projects and relationships for a UXD leadership demonstration. No enterprise records or live integrations.",
    source: "lib/leadership-demo.ts#leadershipDemo",
    period: {
      label: "Q4 2026",
      start: "2026-10-01",
      end: "2026-12-31",
      selectMonth: "2026-10",
    },
    counts: {
      people: plan.people.length,
      projects: plan.initiatives.length,
      headOfUxd: 1,
      functionalLeaders: functionalLeaders.length,
      functionalTeams: new Set(functionalLeaders.map((person) => person.team))
        .size,
      priorities: new Set(plan.initiatives.map((project) => project.priority))
        .size,
      dependencies: plan.initiatives.reduce(
        (sum, project) => sum + project.dependsOn.length,
        0,
      ),
      topPriorityProjects: plan.initiatives.filter(
        (project) => project.importance === "top",
      ).length,
      projectsNeedingAttention: plan.initiatives.filter(
        (project) =>
          project.health === "at_risk" ||
          project.health === "needs_decision" ||
          project.delivery === "blocked",
      ).length,
    },
    files: {
      "people.csv": "People, reporting structure and discipline capacity",
      "projects.csv":
        "Projects, ownership, contributors, priorities and dependencies",
      "workspace.json":
        "Equivalent full Plan object with revision 0; a reference for adapters, not a browser JSON upload",
    },
    identity:
      "Use person and project IDs for all relationships. Display names and legacy owner labels do not resolve identity.",
    persistence:
      "Generating these files does not change saved data. The in-app example remains session-only. Import CSV files into a separate demo database when persistence is needed.",
  };

  return {
    "people.csv": csv(
      plan.people.map((person) => ({
        ...person,
        craft: labels[person.craft],
        isLeader: person.isLeader ? "Yes" : "No",
      })),
    ),
    "projects.csv": csv(
      plan.initiatives.map(({ effort, ...project }) => ({
        ...project,
        status: commitment[project.status],
        importance: importance[project.importance],
        health: health[project.health],
        delivery: delivery[project.delivery],
        ...effort,
      })),
    ),
    "workspace.json": JSON.stringify(plan, null, 2) + "\n",
    "manifest.json": JSON.stringify(manifest, null, 2) + "\n",
  };
}

// Explicit invocation writes only these four repository fixtures. Importing is read-only.
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const directory = new URL("../examples/uxd-demo/", import.meta.url);
  mkdirSync(directory, { recursive: true });
  for (const [name, content] of Object.entries(buildDemoFiles()))
    writeFileSync(new URL(name, directory), content, "utf8");
  console.log("Generated 4 fictional UXD demo files in examples/uxd-demo/.");
}
