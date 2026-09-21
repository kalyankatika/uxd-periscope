import type { Initiative, Person, Plan } from "./domain";
import { leaderProjects, teamIds } from "./work-graph";

export type ExplorerRef = {
  kind: "organization" | "person" | "project" | "priority";
  id: string;
};
export type ExplorerConnection = {
  ref: ExplorerRef;
  label: string;
  relation: string;
};
export type ExplorerScope = {
  ref: ExplorerRef;
  label: string;
  subtitle: string;
  people: Person[];
  projects: Initiative[];
  priorities: string[];
  related: ExplorerConnection[];
  missing: boolean;
};
export const organizationRef: ExplorerRef = {
  kind: "organization",
  id: "root",
};

/** Read-only navigation scope. Effort remains project/discipline data, not person allocations. */
export function getExplorerScope(
  plan: Plan,
  start: string,
  end: string,
  ref: ExplorerRef,
): ExplorerScope {
  const inPeriod = (project: Initiative) =>
    start <= end && project.start <= end && project.end >= start;
  const activeProjects = plan.initiatives.filter(inPeriod);
  const scope: ExplorerScope = {
    ref,
    label: "Unavailable",
    subtitle: "This item is no longer in the workspace.",
    people: [],
    projects: [],
    priorities: [],
    related: [],
    missing: false,
  };
  const add = (
    kind: ExplorerRef["kind"],
    id: string,
    label: string,
    relation: string,
  ) => {
    if (kind === ref.kind && id === ref.id) return;
    const existing = scope.related.find(
      (item) => item.ref.kind === kind && item.ref.id === id,
    );
    if (existing) {
      if (!existing.relation.split(" · ").includes(relation))
        existing.relation += ` · ${relation}`;
    } else scope.related.push({ ref: { kind, id }, label, relation });
  };
  const addPerson = (person: Person, relation: string) =>
    add("person", person.id, person.name, relation);
  const participants = (projects: Initiative[]) => {
    const ids = new Set(
      projects.flatMap((project) => [
        ...(project.leadId ? [project.leadId] : []),
        ...project.memberIds,
      ]),
    );
    return plan.people.filter((person) => ids.has(person.id));
  };

  if (ref.kind === "organization" && ref.id === organizationRef.id) {
    scope.label = "Organization";
    scope.subtitle = "People, projects and priorities";
    scope.people = [...plan.people];
    scope.projects = activeProjects;
    plan.people
      .filter((person) => !person.managerId)
      .forEach((person) => addPerson(person, "Organization leader"));
  } else if (ref.kind === "person") {
    const person = plan.people.find((item) => item.id === ref.id);
    if (!person) scope.missing = true;
    else {
      scope.label = person.name;
      scope.subtitle = person.title || person.team || "Person";
      const ids = teamIds(plan.people, person.id);
      scope.people = plan.people.filter((item) => ids.has(item.id));
      scope.projects = leaderProjects(plan, person.id).filter(inPeriod);
      const manager = plan.people.find((item) => item.id === person.managerId);
      if (manager) addPerson(manager, "Reports to");
      plan.people
        .filter((item) => item.managerId === person.id)
        .forEach((item) => addPerson(item, "Direct report"));
    }
  } else if (ref.kind === "project") {
    const project = plan.initiatives.find((item) => item.id === ref.id);
    if (!project) scope.missing = true;
    else {
      scope.label = project.name;
      scope.subtitle = inPeriod(project)
        ? "Project"
        : "Project outside planning period";
      scope.projects = inPeriod(project) ? [project] : [];
      scope.people = participants([project]);
      scope.people.forEach((person) =>
        addPerson(
          person,
          person.id === project.leadId ? "Project owner" : "Contributor",
        ),
      );
      if (project.priority)
        add("priority", project.priority, project.priority, "Priority");
      for (const other of plan.initiatives) {
        const suffix = inPeriod(other) ? "" : " (outside planning period)";
        if (project.dependsOn.includes(other.id))
          add("project", other.id, other.name, `Depends on${suffix}`);
        if (other.dependsOn.includes(project.id))
          add("project", other.id, other.name, `Required by${suffix}`);
      }
    }
  } else if (ref.kind === "priority") {
    if (
      !ref.id ||
      !plan.initiatives.some((project) => project.priority === ref.id)
    )
      scope.missing = true;
    else {
      scope.label = ref.id;
      scope.subtitle = "Priority";
      scope.projects = activeProjects.filter(
        (project) => project.priority === ref.id,
      );
      scope.people = participants(scope.projects);
      scope.people.forEach((person) => addPerson(person, "Related person"));
    }
  } else scope.missing = true;

  scope.priorities = [
    ...new Set(
      scope.projects.map((project) => project.priority).filter(Boolean),
    ),
  ];
  scope.projects.forEach((project) =>
    add("project", project.id, project.name, "Project"),
  );
  scope.priorities.forEach((priority) =>
    add("priority", priority, priority, "Priority"),
  );
  return scope;
}
