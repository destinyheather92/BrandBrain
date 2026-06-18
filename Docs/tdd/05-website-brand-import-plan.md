# 05 Website Brand Import TDD Plan

## User Story

As a signed-in BrandBrain user, I can import a brand from a public website URL so that BrandBrain can create a brand foundation from existing website metadata.

## Acceptance Criteria

- Website import requires a signed-in Clerk user synced to a local user record.
- Users can open `/brands/import` from the dashboard or brands page.
- Users can submit a website URL, including a bare domain that is normalized to HTTPS.
- BrandBrain fetches the website HTML on the server.
- BrandBrain extracts a brand name from website metadata or title.
- BrandBrain extracts a description from website metadata when available.
- BrandBrain creates a normal editable brand record using the existing brand repository.
- Imported brands appear on `/brands`.
- Failures return typed errors and do not leak raw provider/network errors to the UI.
- This feature does not implement brand memory, AI summarization, templates, projects, or content generation.

## Red / Green Workflow

1. Write tests for URL normalization, metadata extraction, typed failures, the import form, and the dashboard import link.
2. Run Vitest and capture the expected failing output in `Docs/tdd/logs/05-website-brand-import-red.txt`.
3. Implement the minimum schemas, service, server action, form, route, and navigation updates required to pass.
4. Re-run Vitest and capture passing output in `Docs/tdd/logs/05-website-brand-import-green.txt`.
5. Run full tests, typecheck, lint, and build.
6. Open `/brands/import`, import a website, and confirm the imported brand appears on `/brands`.
7. Stop and wait for approval before moving to feature 6.
