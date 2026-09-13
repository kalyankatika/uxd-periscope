# UXD demo dataset

**Entirely fictional.** These files describe the same organization as Periscope's built-in example. They contain no company exports, employee records, credentials or live API responses. They are intended to travel with the repository for a repeatable enterprise showcase.

The dataset contains **26 people, seven functional teams plus the head of UXD, 13 projects, seven priorities and seven project dependencies**. It includes Product Design, Research & insights, Content design, Design systems, Design Strategy, Innovation and UX AI; shared contributors; decision requests; delivery concerns; and one proposed project for capacity comparison.

## Files

| File | Purpose |
| --- | --- |
| [people.csv](people.csv) | Upload as **People CSV**. Includes stable IDs, reporting lines, discipline, team and capacity inputs. |
| [projects.csv](projects.csv) | Upload as **Projects CSV**. Includes stable IDs, owners, contributors, dependencies, priorities, health, dates and discipline effort. |
| [workspace.json](workspace.json) | The same complete records in Periscope's current Plan format: `people`, `initiatives`, `revision`. For developers and future adapter work. |
| [manifest.json](manifest.json) | Fictional-data declaration, dataset metadata, period and record counts. This is documentation metadata, not an import payload. |

CSV uses readable headers and recognized labels; JSON uses canonical field names and enum values. The tests validate that both represent exactly the same records. Names are labels; person/project IDs are the relationship keys. Multiple IDs in CSV are separated by `|`; JSON uses arrays. Dates are ISO `YYYY-MM-DD`; effort is full-time equivalents, not named-person bookings or actual time.

**Use the CSV pair for the current import UI.** Generic JSON file upload is not implemented. `workspace.json` is a full Plan reference, not the proposed enterprise connector envelope and not the JSON-LD graph export. Its `revision: 0` is fixture metadata; any developer using the existing revision-checked API must use the current saved revision and an agreed overwrite workflow. The demo steps below need no API calls.

## Install and start an isolated demo

Clone or copy a repository revision containing this directory, then run commands from the repository root. Use Node.js 22.13 or later; `.nvmrc` records the tested version. The [installation guide](../../docs/installation.md) covers initial setup and prerequisites.

```sh
npm ci
npm run demo:check
npm run build
```

Run a separate demo database on port 3001, leaving any normal workspace untouched.

macOS/Linux:

```sh
DATABASE_PATH=./data/uxd-demo.sqlite npm start -- --port 3001
```

PowerShell:

```powershell
$env:DATABASE_PATH = Join-Path (Get-Location) 'data/uxd-demo.sqlite'
npm start -- --port 3001
```

Open [http://127.0.0.1:3001](http://127.0.0.1:3001). Keep the terminal running. The app and SQLite run locally; no API keys, external database service or connected enterprise systems are needed. The initial dependency installation needs registry access; the dataset itself is already in the repository. This start command binds to localhost and does not publish an enterprise service.

## Demonstrate a real CSV import

1. On a fresh demo database, choose **Open workspace**. The initial saved starter has 12 people and five projects; the larger built-in example is separate and session-only.
2. Open **People & imports → Import organization**. Choose this directory's `people.csv` and `projects.csv`.
3. Choose **Replace people and projects** in this isolated demo workspace. It replaces the starter records with the complete connected fixture. Do not use replace against a real workspace for this demonstration.
4. Select **Review organization**. Expect **26 people and 13 projects after import**. A fresh starter gives 26 new/12 removed people and 13 new/5 removed projects; none updated. Re-importing the same pack instead shows matched IDs as updated. Inspect column and label mappings; no columns should be excluded and all relationship references should be valid.
5. Confirm **Import organization**. Reload and confirm the same counts and relationships remain. These imports are persisted only in `data/uxd-demo.sqlite`. If the banner still says **Example data**, the import is session-only; switch to the saved workspace and repeat there.
6. Set the planning-period month to **October 2026** to review **Q4 2026**. Dates are intentionally fixed for reproducibility, so a later calendar date does not mean the fixture is broken.
7. To repeat from the same baseline, re-import the CSV pair into the demo database. No database deletion is required. Stop this demo with Ctrl+C. The normal workspace remains at its separately configured database path.

The files support the current [mapping contract](../../docs/enterprise-data-mapping.md). Review validates relationships and supported labels; it does not establish that arbitrary real-world source mappings are correct.

## Five-minute showcase

| Step | What to show | Expected result |
| --- | --- | --- |
| Platform overview | Open **Overview**, then all top-priority projects | Five top projects and five projects needing attention, with named owners and recorded reasons. |
| Leader scope | Open **Marcus Reed** in Teams & reporting | Three reports and eight distinct projects. Shared projects count once within his scope. |
| Connected work | Work map → **Accessible component library** → Open project details | Eight related projects; Account opening, Mobile and UX AI standards are the three direct dependents, shown first. |
| Alternative view | Close project details, then switch Work map to **Grid** and open the same project | Same selection and direct connections. Open **AI-assisted research synthesis** to see its Research repository and UX AI standards prerequisites. |
| Capacity scenario | Close project details, then open Capacity → include proposed work | Research peak rises from 138% to 142%; weeks with any discipline over capacity rise from seven to eight of fourteen. The proposal is **Planning assistant discovery**. |
| Data trust | Show the two CSVs, review mappings, then reload the saved demo | IDs preserve reporting, ownership, contributors and dependencies. No live enterprise synchronization is implied. |

Use the [utility review](../../docs/utility-review.md) for the assumptions behind these figures. The capacity model forecasts discipline demand and does not identify an individual to reassign. Source freshness, access control and real connector validation remain separate work.

## Maintain the pack

The source of truth for this fictional example is [lib/leadership-demo.ts](../../lib/leadership-demo.ts). After an intentional example-data change:

```sh
npm run demo:data
npm run demo:check
```

The generator rewrites only the four data/metadata files in this directory. It never reads or writes SQLite and never exports the user's saved workspace. Review and commit the resulting files together with their source change. `npm test` also includes the demo-data checks, so CSV/JSON/example drift is caught by normal verification.

Keep the fictional pack in source control. Real source exports, saved databases, environment files and credentials belong outside the repository. Automatic enterprise API ingestion is future work; this pack provides a reproducible mapping and demonstration baseline.
