import { crafts, type Initiative, type Allocation } from "./domain";
import { DAY } from "./capacity";
export function allocations(
  initiatives: Initiative[],
  weekStarts: string[],
): Allocation[] {
  return initiatives.flatMap((i) =>
    weekStarts.flatMap((weekStart) => {
      let days = 0;
      for (let d = 0; d < 5; d++) {
        const date = new Date(Date.parse(weekStart) + d * DAY)
          .toISOString()
          .slice(0, 10);
        if (date >= i.start && date <= i.end) days++;
      }
      return crafts.map((craft) => ({
        initiativeId: i.id,
        craft,
        weekStart,
        fte: (i.effort[craft] * days) / 5,
      }));
    }),
  );
}
