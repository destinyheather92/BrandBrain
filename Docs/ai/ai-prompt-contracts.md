# BrandBrain AI Prompt Contracts & Structured Output Specification

## Purpose

This document defines:

- Every AI workflow
- Required inputs
- Required outputs
- Validation requirements
- Failure handling

AI must never return unstructured content.

Every workflow must produce validated JSON.

---

# Core AI Rule

AI does not return content.

AI returns data structures.

Bad:

```text
Here is your content...
```

Good:

```json
{
  "title": "",
  "slides": []
}
```

---

# Universal Prompt Structure

Every AI workflow receives:

```ts
type AIContext = {
  brandMemory: BrandMemory

  campaignMemory?: CampaignMemory

  projectMemory?: ProjectMemory

  contentIntelligence: ContentIntelligence

  userRequest: string
}
```

---

# Workflow 1

Creative Brief Generation

Input:

```json
{
  "userRequest": "I want to talk about roof inspections"
}
```

Output:

```json
{
  "goal": "",
  "audience": "",
  "angle": "",
  "hook": "",
  "cta": ""
}
```

Required Fields:

- goal
- audience
- angle
- hook
- cta

Validation Required:

- No empty fields
- Strings only

---

# Workflow 2

Strategy Generation

Input:

Creative Brief

Output:

```json
{
  "goal": "",
  "audience": "",
  "message": "",
  "cta": "",
  "contentType": "carousel"
}
```

---

# Workflow 3

Outline Generation

Output:

```json
{
  "slides": [
    {
      "slideNumber": 1,
      "purpose": "hook"
    }
  ]
}
```

Rules:

- Ordered
- Unique slide numbers
- Minimum 3 slides
- Maximum 10 slides

---

# Workflow 4

Theme Generation

Output:

```json
{
  "palette": {
    "primary": "",
    "secondary": "",
    "accent": ""
  },
  "typography": {
    "heading": "",
    "body": ""
  },
  "layout": {},
  "imageStyle": ""
}
```

Theme must be approved before slide generation.

---

# Workflow 5

Slide Generation

Output:

Canvas JSON only.

Never HTML.

Never markdown.

Never image URLs.

```json
{
  "slideNumber": 1,
  "elements": []
}
```

Must conform to Canvas Object Model schema.

---

# Workflow 6

Caption Generation

Output:

```json
{
  "caption": "",
  "cta": ""
}
```

Future:

```json
{
  "hashtags": []
}
```

---

# Workflow 7

Image Prompt Generation

Output:

```json
{
  "provider": "ideogram",
  "prompt": "",
  "negativePrompt": ""
}
```

Provider options:

- ideogram
- flux
- imagen

---

# Workflow 8

AI Editing

Input:

Canvas
+
User Command

Example:

```text
Make this more modern
```

Output:

```json
{
  "patches": [
    {
      "elementId": "",
      "changes": {}
    }
  ]
}
```

Must never regenerate entire project.

Only patch.

---

# Workflow 9

Single Slide Regeneration

Input:

- Current Slide
- Previous Slide
- Next Slide
- Theme
- Strategy

Output:

One updated slide.

Must preserve:

- Project theme
- Project structure
- Brand memory

---

# AI Failure Handling

If AI output fails validation:

1. Retry once
2. Log failure
3. Return structured error

Never save invalid data.

---

# Zod Validation Rule

Every workflow requires:

```ts
const result = schema.safeParse(response)
```

No exceptions.

---

# Temperature Standards

Creative Brief:

```txt
0.7
```

Strategy:

```txt
0.5
```

Theme:

```txt
0.7
```

Canvas Generation:

```txt
0.3
```

Editing:

```txt
0.2
```

Reason:

Consistent outputs.

---

# Prompt Storage Rule

Prompts live only in:

```txt
src/features/ai/prompts/
```

Never inline prompts inside:

- Components
- Services
- Route handlers

---

# Prompt Versioning

Every prompt requires:

```ts
const VERSION = "1.0.0"
```

Purpose:

Track prompt evolution.

---

# AI Cost Tracking

Every AI call stores:

```json
{
  "provider": "",
  "workflow": "",
  "tokens": 0,
  "cost": 0
}
```

Stored in:

```txt
generation_costs
```

---

# TDD Requirements

Before implementation:

Write tests for:

- Prompt construction
- Output validation
- Failure handling
- Retry logic
- Patch generation
- Provider routing

---

# AI Golden Rule

AI may generate ideas.

AI may generate designs.

AI may generate content.

AI may never bypass:

- Brand Memory
- Content Intelligence
- Validation
- Versioning