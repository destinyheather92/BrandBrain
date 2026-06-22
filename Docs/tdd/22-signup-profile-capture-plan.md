# 22 Sign-up Profile Capture Plan

## Goal

Capture first and last name before account creation so BrandBrain can store a real account profile instead of only an email-derived display name.

## Red

- Add a sign-up profile capture component test that requires first and last name before mounting Clerk sign-up.
- Extend local user sync tests so first and last names are persisted separately.
- Add fallback coverage for names captured in Clerk unsafe metadata.
- Run:

```bash
npm.cmd test -- src/features/auth/tests/signup-profile-capture.test.tsx src/features/users/tests/local-user-sync.service.test.ts > Docs/tdd/logs/22-signup-profile-capture-red.txt
```

## Green

- Add a BrandBrain profile capture step before Clerk sign-up.
- Pass first and last name to Clerk via `initialValues` and BrandBrain unsafe metadata.
- Add nullable `firstName` and `lastName` local user columns.
- Sync built-in Clerk names first, then fallback to BrandBrain sign-up metadata.
- Re-run:

```bash
npm.cmd test -- src/features/auth/tests/signup-profile-capture.test.tsx src/features/users/tests/local-user-sync.service.test.ts > Docs/tdd/logs/22-signup-profile-capture-green.txt
```

## Acceptance

- `/sign-up` asks for first and last name before account setup.
- Local users retain `firstName`, `lastName`, and combined `name`.
- Existing Clerk sign-in behavior is unchanged.
