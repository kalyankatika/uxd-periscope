import type { Plan, Person, Initiative } from "./domain";
export const healthLabels = {
  not_reported: "Not reported",
  on_track: "On track",
  at_risk: "At risk",
  needs_decision: "Decision required",
};
export const deliveryLabels = {
  planned: "Planned",
  in_progress: "In progress",
  blocked: "Blocked",
  completed: "Completed",
};
export const importanceLabels = {
  top: "Top priority",
  high: "High priority",
  normal: "Standard",
};
export const importanceOrder = { top: 0, high: 1, normal: 2 };
export function teamIds(people: Person[], leaderId: string): Set<string> {
  const ids = new Set([leaderId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const person of people)
      if (
        person.managerId &&
        ids.has(person.managerId) &&
        !ids.has(person.id)
      ) {
        ids.add(person.id);
        changed = true;
      }
  }
  return ids;
}
export function leaderProjects(plan: Plan, leaderId: string): Initiative[] {
  const ids = teamIds(plan.people, leaderId);
  return plan.initiatives.filter(
    (p) =>
      (p.leadId !== null && ids.has(p.leadId)) ||
      p.memberIds.some((id) => ids.has(id)),
  );
}
export function leaders(people: Person[]): Person[] {
  return people.filter(
    (p) => p.isLeader || people.some((r) => r.managerId === p.id),
  );
}
export function relatedProjects(plan: Plan, project: Initiative) {
  const participantIds = (p: Initiative) =>
    new Set(p.leadId ? [...p.memberIds, p.leadId] : p.memberIds);
  const participants = participantIds(project);
  const prerequisites = new Set(project.dependsOn);
  const isDependency = (p: Initiative) =>
    prerequisites.has(p.id) || p.dependsOn.includes(project.id);
  return plan.initiatives
    .filter((p) => p.id !== project.id)
    .map((p) => ({
      project: p,
      reasons: [
        ...(prerequisites.has(p.id) ? ["Needed by this project"] : []),
        ...(p.dependsOn.includes(project.id)
          ? ["Depends on this project"]
          : []),
        ...(project.priority && p.priority === project.priority
          ? ["Same business priority"]
          : []),
        ...([...participantIds(p)].some((id) => participants.has(id))
          ? ["Shared people"]
          : []),
      ],
    }))
    .filter((p) => p.reasons.length)
    .sort(
      (a, b) =>
        Number(isDependency(b.project)) - Number(isDependency(a.project)),
    );
}
export function workGraph(plan: Plan) {
  const personId = (id: string) =>
      `urn:periscope:person:${encodeURIComponent(id)}`,
    projectId = (id: string) =>
      `urn:periscope:project:${encodeURIComponent(id)}`,
    priorityId = (label: string) =>
      `urn:periscope:priority:${encodeURIComponent(label)}`;
  const nodes: Record<string, unknown>[] = [
    ...plan.people.map((p) => ({
      "@id": personId(p.id),
      "@type": "schema:Person",
      "schema:name": p.name,
      "schema:jobTitle": p.title,
      team: p.team,
      ...(p.managerId ? { reportsTo: { "@id": personId(p.managerId) } } : {}),
    })),
    ...[
      ...new Set(plan.initiatives.map((p) => p.priority).filter(Boolean)),
    ].map((name) => ({
      "@id": priorityId(name),
      "@type": "Priority",
      "schema:name": name,
    })),
    ...plan.initiatives.map((p) => ({
      "@id": projectId(p.id),
      "@type": "schema:Project",
      "schema:name": p.name,
      "schema:description": p.summary,
      "schema:startDate": p.start,
      "schema:endDate": p.end,
      deliveryStatus: p.delivery,
      health: p.health,
      importance: p.importance,
      commitment: p.status,
      weeklyEffort: p.effort,
      ...(p.leadId ? { ledBy: { "@id": personId(p.leadId) } } : {}),
      contributors: p.memberIds.map((id) => ({ "@id": personId(id) })),
      dependsOn: p.dependsOn.map((id) => ({ "@id": projectId(id) })),
      ...(p.priority ? { supports: { "@id": priorityId(p.priority) } } : {}),
    })),
  ];
  return {
    "@context": {
      schema: "https://schema.org/",
      "@vocab": "urn:periscope:vocab:",
    },
    revision: plan.revision,
    "@graph": nodes,
  };
}
