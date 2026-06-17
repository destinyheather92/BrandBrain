<!-- Every coding agent working on BrandBrain must read this before implementing any features.  -->
# BrandBrain Coding Agent Constitution

## Purpose

This document defines the mandatory engineering standards, architecture rules, testing requirements, and implementation patterns for BrandBrain.

Its purpose is to ensure:

* Consistency
* Maintainability
* Scalability
* Predictability

Across the entire codebase.

---

# Core Philosophy

BrandBrain is:

```text
Brand Memory
+
Content Intelligence
+
AI Orchestration
+
Creative Workspace
```

It is NOT:

```text
A collection of prompts
```

All code should reinforce this architecture.

---

# Development Philosophy

## Rule 1

Long-term maintainability beats short-term speed.

---

## Rule 2

Code must be understandable by future developers.

---

## Rule 3

Every feature starts with tests.

---

## Rule 4

Business logic belongs in services.

Never inside React components.

---

## Rule 5

Database access belongs in repositories.

Never directly inside UI.

---

# TDD Constitution

Mandatory workflow:

```text
Read Story
↓
Read Acceptance Criteria
↓
Write Tests
↓
Run Tests (Fail)
↓
Implement
↓
Run Tests (Pass)
↓
Refactor
```

No exceptions.

---

# Required Test Coverage

Every feature must include:

## Unit Tests

Purpose:

Test business logic.

Examples:

```text
BrandService
ThemeService
CanvasService
ContentIntelligenceService
```

---

## Integration Tests

Purpose:

Test system interactions.

Examples:

```text
Prisma
AI Providers
Storage
Authentication
```

---

## E2E Tests

Purpose:

Test user workflows.

Examples:

```text
Create Brand
Import Website
Generate Carousel
Edit Slide
Export Project
```

---

# Project Structure

```text
src/

├── app/
├── components/
├── features/
├── services/
├── repositories/
├── lib/
├── types/
├── schemas/
├── hooks/
├── providers/
└── tests/
```

---

# Feature Structure

Example:

```text
features/brands/

├── components/
├── services/
├── repositories/
├── schemas/
├── types/
├── tests/
└── actions/
```

Every major feature follows this pattern.

---

# React Rules

## Rule 1

Components must remain small.

Target:

```text
< 250 lines
```

---

## Rule 2

Business logic never belongs inside components.

Bad:

```tsx
const result = calculateBrandScore(...)
```

Good:

```tsx
brandService.calculateScore()
```

---

## Rule 3

Avoid deeply nested state.

Use dedicated hooks.

---

# Service Layer Rules

All business logic belongs in services.

Examples:

```text
BrandService
CanvasService
ThemeService
ProjectService
AIOrchestrator
```

Services should be:

```text
Pure
Testable
Reusable
```

---

# Repository Rules

Repositories own database access.

Examples:

```text
BrandRepository
ProjectRepository
SlideRepository
```

Repositories:

* Query
* Create
* Update
* Delete

Nothing else.

---

# Prisma Rules

## Rule 1

No Prisma queries inside components.

---

## Rule 2

No Prisma queries inside services.

Services call repositories.

---

## Rule 3

Use transactions when creating:

```text
Project
Theme
Slides
Version
```

---

# Zod Validation Rules

All external input must be validated.

Examples:

```text
Forms
AI Responses
API Requests
```

Never trust input.

---

# AI Rules

## Rule 1

AI responses must be structured.

Required:

```json
{
  "success": true
}
```

Never parse free-form text.

---

## Rule 2

Validate all AI responses.

Before:

```text
Save
Render
Display
```

---

## Rule 3

AI never writes directly to database.

Workflow:

```text
AI
↓
Validate
↓
Transform
↓
Save
```

---

# Canvas Rules

The Canvas Object Model is the source of truth.

Never:

```text
Store rendered image as project source
```

Always:

```text
Store canvas JSON
```

---

# Editor Rules

Editor changes:

```text
Update Canvas
↓
Create Version
↓
Autosave
```

Always.

---

# Versioning Rules

Every major mutation creates:

```text
Version Snapshot
```

Examples:

* AI Generation
* AI Edit
* Manual Edit
* Theme Change
* Slide Regeneration

---

# Brand Memory Rules

User edits outrank AI.

Priority:

```text
User Input
↓
Learned Preference
↓
AI Suggestion
```

Never overwrite user decisions.

---

# Content Intelligence Rules

Recommendations must include:

```text
Topic
Score
Reason
```

Never recommend content without explanation.

---

# Error Handling Rules

Every async operation must:

```text
Handle Error
Log Error
Return Typed Error
```

Never throw raw provider errors to UI.

---

# Logging Rules

Log:

```text
AI Calls
Failures
Exports
Imports
Version Restores
```

Do not log:

```text
Secrets
Tokens
Credentials
```

---

# Performance Rules

Target:

```text
Initial Page Load < 2 seconds
```

```text
Editor Load < 3 seconds
```

```text
Autosave < 500ms
```

---

# Accessibility Rules

Required:

* Keyboard navigation
* Focus states
* ARIA labels
* Screen reader support

---

# Code Review Checklist

Before merge:

## Architecture

* Uses service layer
* Uses repository layer
* Follows folder structure

---

## Testing

* Unit tests added
* Integration tests added
* E2E tests added

---

## Validation

* Zod schema exists
* Errors handled

---

## Performance

* No unnecessary rerenders
* No large client bundles

---

## Security

* Authorization verified
* Ownership verified
* Inputs validated

---

# Forbidden Patterns

Never:

```text
❌ Business logic in components
❌ Direct Prisma in components
❌ Any types
❌ Unvalidated AI responses
❌ Skipping tests
❌ Saving invalid canvas JSON
❌ Overwriting user memory
❌ Hardcoded provider logic
```

---

# Architectural Commandments

## Commandment 1

Brand Memory is the primary source of AI context.

---

## Commandment 2

Theme before slides.

---

## Commandment 3

Canvas before exports.

---

## Commandment 4

User edits are sacred.

---

## Commandment 5

Everything is a project.

---

## Commandment 6

Every feature must be testable.

---

## Commandment 7

Every feature must be documented.

---

## Commandment 8

The coding agent must optimize for maintainability over speed.

---

# Definition of Engineering Success

A developer unfamiliar with the codebase should be able to:

1. Find the feature.
2. Understand the flow.
3. Run the tests.
4. Modify the feature.
5. Deploy safely.

Without needing tribal knowledge.

---

# BrandBrain Golden Rule

> If a user still needs ChatGPT and Canva open while using BrandBrain, the feature is not finished.
