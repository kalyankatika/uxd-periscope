import type { Plan } from "./domain";
import { importCsv } from "./csv";
export const peopleCsv = `id,name,craft,fte,nonProjectPct
p1,Alex Morgan,design,1,20
p2,Jamie Chen,design,1,20
p3,Sam Rivera,design,1,20
p4,Taylor Brooks,design,1,20
p5,Jordan Lee,research,1,20
p6,Morgan Davis,research,1,20
p7,Riley Patel,content,1,20
p8,Casey Wilson,content,1,20
p9,Avery Kim,design_eng,1,20
p10,Drew Thomas,design_eng,1,20
p11,Quinn Garcia,design_eng,1,20
p12,Reese Martin,design_eng,1,20`;
export const initiativesCsv = `id,name,start,end,status,design,research,content,design_eng
i1,Unified workspace,2026-10-01,2026-12-31,committed,1.4,1.12,0.6,1.2
i2,Onboarding refresh,2026-10-01,2026-11-13,committed,0.8,0.8,0.5,0.5
i3,Enterprise discovery,2026-10-19,2026-12-11,proposed,0.4,0.8,0.2,0.2
i4,Accessible foundations,2026-11-02,2026-12-31,committed,0.6,0,0.2,0.8
i5,Self-service analytics,2026-11-16,2026-12-31,stretch,0.8,0.4,0.4,0.8`;
export function seed(): Plan {
  return {
    people: importCsv("people", peopleCsv),
    initiatives: importCsv("initiatives", initiativesCsv),
    revision: 0,
  };
}
