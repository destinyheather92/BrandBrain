# Feature 25: Website Theme Palette Recovery TDD Plan

## User Story

As a BrandBrain user, when I generate or regenerate a theme for an imported brand, BrandBrain should use the imported brand website's actual palette instead of falling back to BrandBrain app colors.

## Acceptance Criteria

- Theme generation re-checks the brand website when the brand has a website URL.
- Website palette hints from the live scrape are used even if the brand was imported before palette hints were stored.
- Linked stylesheet colors are included in website scrape data so common CSS-hosted palettes can be detected.
- Non-BrandBrain brands never use BrandBrain cyan/dark defaults as their theme fallback.
- Explicit user-entered brand memory colors still override website and fallback colors.

## Red

Run:

```bash
npm.cmd test -- src/features/themes/tests/theme-engine.service.test.ts src/features/brands/tests/website-fetch.service.test.ts > Docs/tdd/logs/25-website-theme-palette-recovery-red.txt
```

Expected failures before implementation:

- Theme generation does not accept/use a website fetcher.
- Website fetch does not inline linked stylesheet color values.
- Land-management fallback still risks BrandBrain palette colors when scrape data is unavailable.

## Green

Run:

```bash
npm.cmd test -- src/features/themes/tests/theme-engine.service.test.ts src/features/brands/tests/website-fetch.service.test.ts > Docs/tdd/logs/25-website-theme-palette-recovery-green.txt
```

Expected result:

- Focused tests pass.
- Full typecheck, test, lint, and build pass before commit.
