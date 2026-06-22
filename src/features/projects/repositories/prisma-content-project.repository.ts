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

  async findByIdForOwner(projectId: string, ownerUserId: string): Promise<ContentProject | null> {
    const project = await this.client.contentProject.findFirst({
      include: {
        brand: {
          select: {
            name: true
          }
        }
      },
      where: {
        id: projectId,
        ownerUserId
      }
    });

    return project ? parseProject(project) : null;
  }

  async deleteForOwner(projectId: string, ownerUserId: string): Promise<boolean> {
    const result = await this.client.contentProject.deleteMany({
      where: {
        id: projectId,
        ownerUserId
      }
    });

    return result.count > 0;
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

  async updateCanvasForOwner(
    projectId: string,
    ownerUserId: string,
    canvasJson: ContentProject["canvasJson"]
  ): Promise<ContentProject | null> {
    const result = await this.client.contentProject.updateMany({
      data: {
        canvasJson: canvasJson as Prisma.InputJsonValue
      },
      where: {
        id: projectId,
        ownerUserId
      }
    });

    if (result.count === 0) {
      return null;
    }

    return this.findByIdForOwner(projectId, ownerUserId);
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
