# Issue triage guide

Use this guide to keep the backlog understandable and actionable.

## Required issue quality

A useful issue identifies one problem, gives enough context to reproduce or evaluate it, and states the expected outcome. Ask for clarification rather than guessing at missing requirements.

## Priority guidance

- **High:** security boundary failure, data exposure, unbounded resource consumption, or a regression that makes core usage unsafe.
- **Normal:** broken documented behaviour, important compatibility issue, or a feature aligned with the roadmap.
- **Low:** cosmetic issue, optional enhancement, or minor documentation improvement.

Priority is a maintainer assessment, not a severity rating or response-time promise.

## Good first issue criteria

Mark an issue `good first issue` only when:
- The scope is small and bounded.
- Acceptance criteria are explicit.
- Relevant files and tests are identified.
- No major architecture decision is required.
- The change can be validated locally.
- Security-sensitive review requirements are clear.

Use `help wanted` for work that benefits from community involvement but may need more context or experience.

## Closing issues

Close as completed only when the acceptance criteria are met and the change is merged or the report is otherwise resolved. Close as not planned with a short explanation. Link duplicates to the canonical issue.
