import type { Brand } from "@/features/brands/types/brand";
import type { BrandMemory, BrandMemoryRepository } from "@/features/brands/types/brand-memory";
import type { BrandRepository } from "@/features/brands/types/brand";
import type { ContentProject, ContentProjectRepository } from "@/features/projects/types/content-project";

import type { CreativeBrief, CreativeBriefResult } from "../types/creative-brief";

type GenerateCreativeBriefForUserParams = {
  brandMemoryRepository: BrandMemoryRepository;
  brandRepository: BrandRepository;
  ownerUserId: string;
  projectId: string;
  projectRepository: ContentProjectRepository;
  userRequest: string;
};

type CreativeBriefDomain = "generic" | "land-management" | "mental-health";

export async function generateCreativeBriefForUser({
  brandMemoryRepository,
  brandRepository,
  ownerUserId,
  projectId,
  projectRepository,
  userRequest
}: GenerateCreativeBriefForUserParams): Promise<CreativeBriefResult> {
  try {
    const project = await projectRepository.findByIdForOwner(projectId, ownerUserId);

    if (!project) {
      return failure("project_not_found", "Project could not be found.");
    }

    const brand = await brandRepository.findByIdForOwner(project.brandId, ownerUserId);

    if (!brand) {
      return failure("brand_not_found", "Brand could not be found.");
    }

    const memory = await brandMemoryRepository.getByBrandId(brand.id);
    const brief = buildCreativeBrief({
      brand,
      memory,
      project,
      userRequest
    });

    if (!isCompleteBrief(brief)) {
      return failure("invalid_creative_brief", "Creative brief could not be generated.");
    }

    return {
      brief,
      ok: true,
      status: "generated"
    };
  } catch (error) {
    console.error("Creative brief generation failed.", error);

    return failure("creative_brief_failed", "Creative brief could not be generated.");
  }
}

function buildCreativeBrief({
  brand,
  memory,
  project,
  userRequest
}: {
  brand: Brand;
  memory: BrandMemory | null;
  project: ContentProject;
  userRequest: string;
}): CreativeBrief {
  const request = normalizeText(userRequest) || project.title;
  const audience = normalizeText(memory?.audience) || fallbackAudience(brand);
  const services = splitList(memory?.productsServices);
  const cta = selectCtaLabel(memory?.preferredCtas, brand);
  const topic = deriveTopic(request, project.title, services);
  const domain = inferDomain({
    audience,
    brand,
    memory,
    project,
    request,
    services
  });

  if (domain === "mental-health") {
    return {
      angle:
        "Normalize the nervous system response, name what is happening in plain language, and offer one grounded next step without shame or pressure.",
      audience,
      cta,
      goal: `Help ${lowerFirst(audience)} understand ${topic.toLowerCase()} and feel clear about one supportive next step.`,
      hook: `${capitalizeFirst(topic)} is a nervous system signal, not a personal failure.`
    };
  }

  if (domain === "land-management") {
    return {
      angle:
        "Lead with practical property priorities, show what should happen first, and connect the decision to safer, cleaner land work.",
      audience,
      cta,
      goal: `Help ${lowerFirst(audience)} understand ${topic.toLowerCase()} before the season creates bigger problems.`,
      hook: `Stop guessing what your land needs first.`
    };
  }

  return {
    angle:
      "Turn the vague idea into one useful customer insight, support it with practical context, and close with a single next step.",
    audience,
    cta,
    goal: `Help ${lowerFirst(audience)} understand ${topic.toLowerCase()} and know what action to take next.`,
    hook: `${capitalizeFirst(topic)} gets easier when the next step is clear.`
  };
}

function inferDomain({
  audience,
  brand,
  memory,
  project,
  request,
  services
}: {
  audience: string;
  brand: Brand;
  memory: BrandMemory | null;
  project: ContentProject;
  request: string;
  services: string[];
}): CreativeBriefDomain {
  const context = [
    audience,
    brand.description,
    brand.industry,
    brand.name,
    memory?.brandRules,
    memory?.notes,
    memory?.voice,
    project.title,
    request,
    services.join(" ")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    /\b(counseling|counselling|therapy|therapist|mental health|anxiety|trauma|nervous system|burnout|grounding|somatic|psychotherapy|wellness)\b/.test(
      context
    )
  ) {
    return "mental-health";
  }

  if (/\b(land clearing|land management|grading|drainage|acreage|brush|forestry|rural|storm cleanup)\b/.test(context)) {
    return "land-management";
  }

  return "generic";
}

function deriveTopic(request: string, projectTitle: string, services: string[]): string {
  const context = `${request} ${projectTitle}`.toLowerCase();
  const matchingService = services.find((service) => context.includes(service.toLowerCase()));

  if (matchingService) {
    return capitalizeFirst(matchingService);
  }

  const anxietyMatch = context.match(/\b(anxiety(?: spikes?)?|nervous system overwhelm|burnout|grounding)\b/);

  if (anxietyMatch?.[1]) {
    return capitalizeFirst(anxietyMatch[1]);
  }

  const aboutMatch = request.match(/\b(?:about|on|for)\s+(.{4,80})$/i);

  if (aboutMatch?.[1]) {
    return capitalizeFirst(cleanTopic(aboutMatch[1]));
  }

  return capitalizeFirst(cleanTopic(projectTitle));
}

function fallbackAudience(brand: Brand): string {
  return brand.industry ? `${brand.industry} customers` : "your ideal customers";
}

function selectCtaLabel(value: string | null | undefined, brand: Brand): string {
  const candidates = splitList(value)
    .flatMap((candidate) => candidate.split(/[.;!?]+/))
    .map((candidate) =>
      candidate
        .replace(/\b(?:cta|ctas|preferred|examples?)\s*:/gi, "")
        .replace(/^[-*\d.)\s]+/, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
  const selected =
    candidates.find((candidate) => /^(book|call|contact|download|explore|get|join|learn|schedule|start|try|visit)\b/i.test(candidate)) ??
    candidates[0];

  return selected || (brand.industry?.toLowerCase().includes("counsel") ? "Schedule a consultation" : "Learn more");
}

function splitList(value: string | null | undefined): string[] {
  return normalizeText(value)
    .split(/\r?\n|,|\s+\|\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function cleanTopic(value: string): string {
  return value
    .replace(/[.!?]+$/g, "")
    .replace(/\b(carousel|post|slides?|content|make me|create)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isCompleteBrief(brief: CreativeBrief): boolean {
  return Object.values(brief).every((value) => value.trim().length > 0);
}

function lowerFirst(value: string): string {
  return value ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;
}

function capitalizeFirst(value: string): string {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

function failure(
  code: Extract<CreativeBriefResult, { ok: false }>["error"]["code"],
  message: string
): CreativeBriefResult {
  return {
    error: {
      code,
      message
    },
    ok: false,
    status: "failed"
  };
}
