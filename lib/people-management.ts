import { personSchema, planSchema, type Person, type Plan } from "./domain";

function validPlan(plan: Plan): Plan {
  const result = planSchema.safeParse(plan);
  if (!result.success)
    throw new Error(
      result.error.issues.map((issue) => issue.message).join("; "),
    );
  return result.data;
}

function requirePerson(plan: Plan, id: string, label: string): Person {
  const person = plan.people.find((person) => person.id === id);
  if (!person)
    throw new Error(`${label} no longer exists. Select another person.`);
  return person;
}

function subtreeIds(plan: Plan, personId: string): Set<string> {
  const children = new Map<string, string[]>();
  for (const person of plan.people) {
    if (person.managerId !== null) {
      const reports = children.get(person.managerId) ?? [];
      reports.push(person.id);
      children.set(person.managerId, reports);
    }
  }
  const ids = new Set<string>();
  const pending = [personId];
  while (pending.length) {
    const id = pending.pop()!;
    if (ids.has(id)) continue;
    ids.add(id);
    pending.push(...(children.get(id) ?? []));
  }
  return ids;
}

/** Add or update a person by ID, validating the complete resulting workspace. */
export function upsertPerson(plan: Plan, person: Person): Plan {
  const current = validPlan(plan);
  const parsed = personSchema.safeParse(person);
  if (!parsed.success)
    throw new Error(
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  const next = parsed.data;
  if (next.managerId === next.id)
    throw new Error("A person cannot report to themselves.");
  if (next.managerId !== null)
    requirePerson(current, next.managerId, "The selected manager");
  const exists = current.people.some((person) => person.id === next.id);
  return validPlan({
    ...current,
    people: exists
      ? current.people.map((person) => (person.id === next.id ? next : person))
      : [...current.people, next],
  });
}

/** Move a person and their reporting subtree without changing project links. */
export function movePerson(
  plan: Plan,
  personId: string,
  managerId: string | null,
  adoptManagerTeam = false,
): Plan {
  const current = validPlan(plan);
  requirePerson(current, personId, "This person");
  const manager =
    managerId === null
      ? null
      : requirePerson(current, managerId, "The selected manager");
  const subtree = subtreeIds(current, personId);
  if (manager && subtree.has(manager.id))
    throw new Error(
      "Choose a manager outside this person's reporting hierarchy.",
    );
  if (adoptManagerTeam && !manager)
    throw new Error("Select a manager to move this hierarchy to their team.");
  return validPlan({
    ...current,
    people: current.people.map((person) => ({
      ...person,
      managerId: person.id === personId ? managerId : person.managerId,
      team:
        adoptManagerTeam && manager && subtree.has(person.id)
          ? manager.team
          : person.team,
    })),
  });
}

export function removalImpact(plan: Plan, personId: string) {
  const current = validPlan(plan);
  requirePerson(current, personId, "This person");
  return {
    directReports: current.people.filter(
      (person) => person.managerId === personId,
    ),
    ownedProjects: current.initiatives.filter(
      (project) => project.leadId === personId,
    ),
    contributedProjects: current.initiatives.filter((project) =>
      project.memberIds.includes(personId),
    ),
  };
}

/** Remove one person while retaining their reports and every project. */
export function removePerson(
  plan: Plan,
  personId: string,
  reportsTo: string | null,
  projectOwnerId: string | null,
): Plan {
  const current = validPlan(plan);
  requirePerson(current, personId, "This person");
  if (reportsTo !== null) {
    requirePerson(current, reportsTo, "The selected manager");
    if (subtreeIds(current, personId).has(reportsTo))
      throw new Error(
        "Choose a manager outside the removed person's reporting hierarchy.",
      );
  }
  const owner =
    projectOwnerId === null
      ? null
      : requirePerson(current, projectOwnerId, "The selected project owner");
  if (owner?.id === personId)
    throw new Error("Choose a project owner who will remain in the workspace.");
  return validPlan({
    ...current,
    people: current.people
      .filter((person) => person.id !== personId)
      .map((person) =>
        person.managerId === personId
          ? { ...person, managerId: reportsTo }
          : person,
      ),
    initiatives: current.initiatives.map((project) => ({
      ...project,
      ...(project.leadId === personId
        ? { leadId: projectOwnerId, owner: owner?.name ?? "" }
        : {}),
      memberIds: project.memberIds.filter((id) => id !== personId),
    })),
  });
}
