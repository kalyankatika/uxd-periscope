/** Navigation uses relationship IDs, never labels, and removes deleted records. */
export function graphTrail(
  trail: readonly string[],
  validIds: ReadonlySet<string>,
) {
  return trail.filter(
    (id, index) => validIds.has(id) && trail.indexOf(id) === index,
  );
}

export function visitGraphNode(
  trail: readonly string[],
  id: string,
  validIds: ReadonlySet<string>,
) {
  const current = graphTrail(trail, validIds);
  if (!validIds.has(id)) return current;
  const index = current.indexOf(id);
  return index >= 0 ? current.slice(0, index + 1) : [...current, id];
}
