# Periscope Manager Loop

Use for substantial, multi-phase Periscope work. This is an execution recipe, not an open-ended product backlog. Start with the user's current objective and the constraints in AGENTS.md.

## Start a run

1. Open this repository in Codex and select Astra if available. Fetch and switch to the branch containing these instructions without discarding local changes.
2. Describe the requested outcome, references, must-preserve behavior, and observable completion criteria. Existing project context can supply these; ask only for materially missing decisions.
3. Send the launch prompt below. Use `/goal` in an environment that supports it; otherwise send the same objective as a normal task. A normal task does not promise background persistence.
4. Check the manager's updates or BUILD_STATE.md. Use `/goal pause` and `/goal resume` where supported. Do not start competing managers on the same checkout.
5. Review the final working result and evidence. Record a new objective before starting another run.

```text
/goal Apply the Periscope Manager Loop in docs/manager-loop.md to this task:
[DESCRIBE THE REQUESTED OUTCOME].
Done when: [OBSERVABLE ACCEPTANCE CRITERIA].
Execution boundary: [LOCAL WORK / REVIEWABLE BRANCH / AUTHORIZED DEPLOYMENT].
Optional run budget: [TIME OR USAGE LIMIT].
Use AGENTS.md and reconcile BUILD_STATE.md with the actual workspace.
Create a bounded phase plan, delegate implementation when available,
verify each phase, and continue until the agreed outcome is complete.
Preserve saved workspace data and the existing Periscope product contracts.
```

## Roles and context

The primary agent is the manager. It owns the brief, priorities, dependencies, acceptance, integration, and BUILD_STATE.md. Start with one implementer. Add at most two independent workers when they remove a concrete bottleneck, subject to runtime limits. Do not change global agent settings for this workflow.

Use actual spawn, message, and follow-up tools. Do not treat a `/goal` string sent to a child as proof that goal mode was activated. If child goal controls exist, use them; otherwise the manager assigns and follows up on bounded phases. If delegation is unavailable, disclose this and execute the same phase/review loop in one agent.

Give each implementer the outcome, relevant files, project constraints, owned files, dependencies, acceptance checks, and expected evidence. Keep different writers off the same files. Use isolated worktrees if appropriate and identify the revision being integrated. The manager can inspect and integrate while an implementer works, but should avoid conflicting edits.

## Prepare and execute

1. Inspect the requested area and existing state. Outline a few outcome-based phases; detail the current phase only. Resolve feasibility and access risks early.
2. Record each phase's dependencies, acceptance criteria, and verification approach in BUILD_STATE.md. Preserve previous verified outcomes when resuming; replace an old objective only when the user requests new work.
3. Assign the current phase. The implementer returns changed files or commit, behavior delivered, checks and results, and unresolved limitations.
4. Inspect changes and evidence before accepting the phase. Use focused independent checks to resolve material uncertainty. A worker's claim of completion is insufficient; repeated broad verification without a concrete reason is unnecessary.
5. Send specific corrections for unmet criteria. Otherwise update state and advance automatically. Keep optional polish separate. Do not weaken criteria or skip required dependencies to claim completion.
6. Verify the integrated user flow against the original brief and deliver the result. Do not manufacture new scope after completion.

## Periscope verification choices

Select checks for the change; this table is not a mandatory full-suite itinerary. Functional changes still require the relevant tests and `npm run build` specified in AGENTS.md. Use `npm run typecheck` when types change or type correctness remains uncertain.

| Changed area | Relevant existing evidence |
| --- | --- |
| Capacity and scenarios | tests/capacity.test.ts; weekly proration and committed/proposed/backlog behavior |
| Import preview and relationships | tests/import-preview.test.ts, tests/work-graph.test.ts; docs/enterprise-data-mapping.md |
| Persistence, API, migration | tests/persistence.test.ts, tests/api.test.ts, tests/migration.test.ts; example/saved separation and stale-write handling |
| Work map and grid | tests/graph-map.test.ts, tests/graph-grid.test.ts; selection, filters, focus, and cross-view continuity |
| Copy and instructions | Review meaning, paths, links, and diff; no app build for documentation-only changes |

For a focused test, use `node --import tsx --test tests/<relevant-file>.test.ts`. Use fictional disposable fixtures and an isolated DATABASE_PATH for manual write verification; never experiment against the user's saved database. Keep real workspace records out of logs and committed state files.

For visual or interactive changes, inspect the running experience when browser use is authorized under AGENTS.md. State when visual behavior could not be verified. Preserve Fidelity Sans, #368727 actions, rounded buttons, and the Work map design unless the task changes them. Preserve stable IDs, import review, taxonomy validation, and explicit delivery-health semantics. Never imply live enterprise synchronization exists.

## Stalls, budgets, and completion

Track working outcomes, resolved uncertainty, and blockers rather than checkbox counts. Two failed attempts on the same blocker trigger diagnosis and a materially different approach, task split, or a focused request for missing input. Do not abandon a required item merely because it takes time.

Report at meaningful checkpoints: phase, verified outcome, blocker, next action. Record the latest useful state before stopping or handing off. Honor the user's run budget using available controls; disclose when exact time or token enforcement is unavailable. No budget means execute the bounded brief, not an unlimited improvement loop.

Stop when the objective is verified, the budget is reached, or required external input/authorization prevents further useful work. Continue any independent authorized work before treating a blocker as global. Final handoff includes behavior, evidence, limitations, revision/artifact location, and the exact next action if blocked.

## Resume in a new session

```text
Resume Periscope using AGENTS.md, docs/manager-loop.md, and BUILD_STATE.md.
Reconcile recorded status with the actual branch, files, and evidence.
Preserve completed work, identify the first unmet acceptance criterion,
and continue the existing objective. Do not invent a new backlog.
```

Goal command references: [Follow a goal](https://learn.chatgpt.com/use-cases/follow-goals) and [Long-running work](https://learn.chatgpt.com/docs/long-running-work). Availability depends on the execution environment. Installing this recipe does not activate a goal in another Codex session.
