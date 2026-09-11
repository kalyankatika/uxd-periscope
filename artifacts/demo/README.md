# Periscope — fictional UXD planning demo

This demo uses invented people and planning estimates. It does not contain actual Fidelity employee, customer, project, or operational data.

## Shareable recording

`periscope-demo.mp4` is a 2-minute 12-second, 1920 × 1080 H.264 MP4 captioned recording of the working application. It has no narration or music, so it can be viewed without sound. The walkthrough was captured in a separate SQLite workspace; the original local plan was not modified.

## Scenario

A 12-person financial-services UXD team is planning Q4 2026:

- Four designers, two researchers, two content designers, and four design engineers.
- Availability varies from 0.5 to 1.0 FTE; non-project time ranges from 10% to 25%.
- Net weekly capacity: design 3.09, research 1.40, content 1.40, design engineering 2.65 — **8.54 FTE total**.
- Three committed initiatives, one proposed discovery initiative, and one stretch initiative at the start.

The starting research plan consumes 1.68 FTE against 1.40 available: **120%** in six full weeks. Rescoping account-opening research to 0.56 FTE removes the baseline overload. Including the retirement-discovery proposal would then raise research demand to **150%**. Moving that proposal to November 16 and reducing its weekly research effort to 0.56 brings the scenario within capacity. The demo explicitly saves it as committed and captures a new idea as stretch work.

This is an illustrative planning tradeoff, not evidence that real work can be reduced without changing scope. Capacity at 100% has no additional weekly buffer beyond the non-project allowance.

## Files

- `people.csv`: reusable fictional people import.
- `initiatives.csv`: starting initiative import with intentional overload.
- `scenario.json`: complete starting scenario.
- `capacity-review.csv`: exported final committed capacity review.
- `initiatives-final.csv`: exported final commitments and stretch work.
- `chapters.json`: recording chapter labels and captions.

To recreate the start, import `people.csv` and `initiatives.csv` using “Replace all” in a demo workspace. Select Q4 2026. To recreate the final decisions, use `initiatives-final.csv` instead.

## Chapters

- 00:00 — See the real capacity
- 00:10 — Bring your team data
- 00:23 — Resolve the baseline overload
- 00:41 — Test the next request
- 00:52 — Find a plan that fits
- 01:13 — Make the commitment
- 01:31 — Capture the next idea
- 01:45 — Share the planning decision
