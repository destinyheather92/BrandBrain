# BrandBrain Release Readiness Checklist

## Purpose

This document defines the requirements that must be satisfied before any release can be deployed.

Its purpose is to ensure:

* Stability
* Security
* Performance
* Reliability
* Consistency

No release should be deployed unless all applicable checklist items are complete.

---

# Release Types

## Internal Development Release

Purpose:

Developer testing.

Requirements:

* Unit tests passing
* TypeScript passing
* Lint passing

---

## Beta Release

Purpose:

Founder testing.

Requirements:

* Unit tests
* Integration tests
* Core E2E tests

---

## Production Release

Purpose:

Public deployment.

Requires all sections of this document.

---

# CI/CD Checklist

## Build

* [ ] Production build succeeds
* [ ] TypeScript passes
* [ ] ESLint passes
* [ ] No warnings treated as errors

Commands:

```bash
npm run build
npm run lint
npm run typecheck
```

---

## Tests

### Unit Tests

* [ ] All unit tests passing

Command:

```bash
npm run test
```

---

### Integration Tests

* [ ] Database tests passing
* [ ] AI integration tests passing
* [ ] Storage tests passing

---

### E2E Tests

* [ ] Authentication flow
* [ ] Brand creation flow
* [ ] Website import flow
* [ ] Carousel generation flow
* [ ] Editor flow
* [ ] Export flow

Command:

```bash
npm run test:e2e
```

---

# Security Checklist

## Authentication

* [ ] Protected routes require authentication
* [ ] Session validation working
* [ ] User ownership checks implemented

---

## Authorization

Verify users cannot access:

* Other brands
* Other projects
* Other assets
* Other exports

Required Tests:

* [ ] Ownership tests passing

---

## Secrets

Verify:

* [ ] No API keys in source control
* [ ] No secrets in client
