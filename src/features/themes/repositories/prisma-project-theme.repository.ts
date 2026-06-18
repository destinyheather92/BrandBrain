import type { PrismaClient } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

import { projectThemeSchema } from "../schemas/project-theme.schema";
import type { ProjectTheme, ProjectThemeRepository, ProjectThemeUpsertInput } from "../types/project-theme";

type ThemeRecord = {
  brandId: string;
  createdAt: Date;
  id: string;
  imageStyle: string;
  layout: unknown;
  name: string;
  ownerUserId: string;
  palette: unknown;
  projectId: string;
  typography: unknown;
  updatedAt: Date;
};

export class PrismaProjectThemeRepository implements ProjectThemeRepository {
  constructor(private readonly client: PrismaClient) {}

  async findByProjectIdForOwner(projectId: string, ownerUserId: string): Promise<ProjectTheme | null> {
    const theme = await this.client.theme.findFirst({
      where: {
        ownerUserId,
        projectId
      }
    });

    return theme ? parseProjectTheme(theme) : null;
  }

  async upsertForProject(input: ProjectThemeUpsertInput): Promise<ProjectTheme> {
    const theme = await this.client.theme.upsert({
      create: {
        brandId: input.brandId,
        id: input.id,
        imageStyle: input.imageStyle,
        layout: input.layout as Prisma.InputJsonValue,
        name: input.name,
        ownerUserId: input.ownerUserId,
        palette: input.palette as Prisma.InputJsonValue,
        projectId: input.projectId,
        typography: input.typography as Prisma.InputJsonValue
      },
      update: {
        brandId: input.brandId,
        imageStyle: input.imageStyle,
        layout: input.layout as Prisma.InputJsonValue,
        name: input.name,
        ownerUserId: input.ownerUserId,
        palette: input.palette as Prisma.InputJsonValue,
        typography: input.typography as Prisma.InputJsonValue
      },
      where: {
        projectId: input.projectId
      }
    });

    return parseProjectTheme(theme);
  }
}

export function createPrismaProjectThemeRepository(): ProjectThemeRepository {
  return new PrismaProjectThemeRepository(getPrisma());
}

function parseProjectTheme(theme: ThemeRecord): ProjectTheme {
  return projectThemeSchema.parse(theme);
}
