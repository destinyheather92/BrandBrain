# BrandBrain Product Discovery Document

## Discovery Status

**Status:** Completed (v1)

This document captures the product discovery process, user pain points, product vision, core decisions, MVP scope, and foundational architecture decisions for BrandBrain.

---

# Product Vision

BrandBrain is an AI-powered Creative Operating System that helps non-designers and non-copywriters transform simple business ideas into fully branded, editable marketing content.

Unlike traditional AI tools that generate content and forget context, BrandBrain maintains persistent brand memory, content intelligence, editable projects, and reusable creative assets.

The goal is to eliminate the need to constantly switch between ChatGPT, Canva, and other tools.

---

# Founder Problem Statement

Current workflow:

Idea
→ ChatGPT
→ Content Generation
→ Copy/Paste
→ Canva
→ Manual Design
→ Export

Problems:

* Repeatedly defining brand context
* AI forgetting brand voice
* Content scattered across tools
* Difficulty editing generated content
* Generic outputs
* Inconsistent branding
* Time wasted recreating designs
* Lack of content organization
* Creative paralysis

The founder frequently knows what they want to talk about but does not know how to turn that idea into professional marketing content.

---

# Core User

Initial user:

* Solo creator
* Marketing freelancer
* Agency owner
* Multi-brand content creator

The founder is the primary user and customer during MVP development.

---

# Product North Star

BrandBrain helps users transform simple business ideas into professional, editable, brand-consistent content without needing design expertise, copywriting expertise, ChatGPT, or Canva.

---

# Core Product Principles

## Principle 1

Generated content is never final.

Everything remains:

* Editable
* Versioned
* Recoverable
* Reusable

---

## Principle 2

Every generation becomes a Project.

Nothing exists only in temporary AI output.

---

## Principle 3

Brand is the center of the system.

Everything belongs to a Brand.

---

## Principle 4

Theme before content.

AI generates:

1. Strategy
2. Outline
3. Theme
4. Slides

Never generate slides first.

---

## Principle 5

Editing is more important than generation.

The product succeeds when users stop opening Canva.

---

# Core Product Pillars

## 1. Brand Memory Engine

Stores:

* Website
* Logo
* Colors
* Fonts
* Voice
* Audience
* Products
* Services
* Competitors
* Brand Rules
* Preferred CTAs
* Content History

Learns from user behavior.

---

## 2. Content Intelligence Engine

Provides:

* Content Suggestions
* Topic Recommendations
* Content Pillars
* Monthly Content Plans
* Topic Saturation Detection
* Hook History
* CTA History

Optimization Goal:

Performance-first recommendations.

---

## 3. Creative Director Engine

Transforms simple ideas into strategic content plans.

Input:

"I want to talk about roof inspections."

Output:

* Audience
* Goal
* Angle
* Hook
* CTA
* Structure

Creative Brief is generated first.

User can optionally skip.

---

## 4. Theme Engine

Creates:

* Typography
* Color System
* Layout Rules
* Image Style
* Spacing Rules

Theme is stored separately from slides.

---

## 5. Creative Workspace

Canva-style editing environment.

Supports:

* Text
* Images
* Logos
* Shapes
* Icons
* CTA Components
* Backgrounds

Capabilities:

* Drag
* Resize
* Rotate
* Layering
* AI Design Commands

---

## 6. Content Projects

Every content asset becomes a saved project.

Contains:

* Strategy
* Outline
* Theme
* Slides
* Images
* Captions
* Versions
* Exports

---

# Website Import System

Automatic extraction:

* Logo
* Colors
* Fonts
* Services
* Products
* About Us
* Contact Information
* Testimonials
* FAQs
* Existing Blog Content
* Social Links

AI-generated suggestions:

* Brand Voice
* Audience
* Content Pillars
* Suggested CTAs
* Suggested Topics

Users may edit all extracted data.

---

# AI Provider Strategy

## OpenAI

Used for:

* Strategy
* Briefs
* Captions
* Content Generation
* Editing
* Background Removal

---

## Ideogram

Used for:

* Social Graphics
* Carousel Covers
* Text-Heavy Designs

---

## Flux

Used for:

* Marketing Photography
* Product Mockups

---

## Imagen

Used for:

* Consistent Brand Imagery

---

# Canvas Editor Direction

Editor Architecture:

Editable Canvas Object Model

Slides are NOT stored as images.

Slides are stored as editable canvas structures.

Example Elements:

* Text
* Images
* Logos
* Shapes
* Icons
* CTA Blocks

Future AI editing modifies canvas objects rather than generating entirely new slides.

---

# Content Intelligence Decisions

BrandBrain should:

* Suggest content ideas automatically
* Track topic saturation
* Generate content pillars
* Generate monthly content plans
* Learn from previous content
* Learn from user edits

Examples:

If users repeatedly change CTA wording, BrandBrain should begin preferring those CTAs automatically.

---

# Memory Hierarchy

User
→ Brand
→ Campaign
→ Project
→ Slide

Each layer stores memory independently.

---

# MVP Scope

Included:

* Authentication
* Website Import
* Brand Memory
* Asset Library
* Content Intelligence
* Creative Brief Builder
* Theme Engine
* Carousel Generator
* AI Image Generation
* Canva-Lite Editor
* Templates
* Project Duplication
* Autosave
* Version History
* PNG Export
* JPG Export
* PDF Export

Excluded:

* Instagram Publishing
* Scheduling
* Team Collaboration
* Multi-User Brands
* Analytics

---

# Technical Decisions

Canvas Size:

MVP supports:

1080 x 1080

Future versions add:

* 1080 x 1350
* 1080 x 1920
* Additional formats

---

# TDD Mandate

Every feature follows:

User Story
→ Acceptance Criteria
→ Tests
→ Implementation
→ Refactor

Required test layers:

* Unit
* Integration
* E2E

No feature is considered complete without tests.

---

# Success Criteria

A user can:

1. Create a brand.
2. Import website data.
3. Generate a creative brief.
4. Generate a carousel.
5. Edit every slide.
6. Save the project.
7. Reopen the project later.
8. Export content.
9. Reuse templates.
10. Avoid opening Canva for routine content creation.

---

# Discovery Conclusion

BrandBrain is not an AI content generator.

BrandBrain is an AI-powered Creative Operating System that combines persistent brand memory, content intelligence, AI generation, and editable creative projects into a single platform.
