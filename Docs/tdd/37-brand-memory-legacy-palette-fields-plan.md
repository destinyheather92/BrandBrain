# 37 Brand Memory Legacy Palette Fields Plan

## User Story

As a BrandBrain user with an existing brand, I need Brand Memory to keep saving after new palette fields are added.

## Acceptance Criteria

- Existing brand memory rows that do not yet include palette fields parse successfully.
- Missing palette fields normalize to `null`.
- Saving Brand Memory continues to work for brands created before palette support.

## TDD Steps

1. Add a failing regression test for legacy memory rows missing palette fields.
2. Capture red output in `Docs/tdd/logs/37-brand-memory-legacy-palette-fields-red.txt`.
3. Make palette fields optional at the parser boundary and normalize them to `null`.
4. Capture green output in `Docs/tdd/logs/37-brand-memory-legacy-palette-fields-green.txt`.
