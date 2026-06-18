import type { PrismaClient } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

import { contentProjectSchema } from "../schemas/content-project.schema";
import type {
  ContentProject,
  ContentProjectCreateForUserInput,
  ContentProjectRepository
} from "../types/content-project";

type ProjectWithBrandName = {
  brand: {
    name: string;
  };
  brandId: string;
  canvasJson: unknown;
  createdAt: Date;
  format: string;
  id: string;
  ownerUserId: string;
  status: string;
  title: string;
  updatedAt: Date;
};

export class PrismaContentProjectRepository implements ContentProjectRepository {
  constructor(private readonly client: PrismaClient) {}

  async create(input: ContentProjectCreateForUserInput): Promise<ContentProject> {
    const project = await this.client.contentProject.create({
      data: {
        brandId: input.brandId,
        canvasJson: input.canvasJson as Prisma.InputJsonValue,
        format: input.format,
        ownerUserId: input.ownerUserId,
        status: input.status,
        title: input.title
      },
      include: {
        brand: {
          select: {
            name: true
          }
        }
      }
    });

    return parseProject(project);
  }

  async listByOwnerUserId(ownerUserId: string): Promise<ContentProject[]> {
    const projects = await this.client.contentProject.findMany({
      include: {
        brand: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      where: {
        ownerUserId
      }
    });

    return projects.map((project) => parseProject(project));
  }
}

export function createPrismaContentProjectRepository(): ContentProjectRepository {
  return new PrismaContentProjectRepository(getPrisma());
}

function parseProject(project: ProjectWithBrandName): ContentProject {
  return contentProjectSchema.parse({
    ...project,
    brandName: project.brand.name
  });
}
