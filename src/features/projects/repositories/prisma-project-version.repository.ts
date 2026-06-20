import type { PrismaClient } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

import { projectVersionSchema } from "../schemas/project-version.schema";
import type {
  ProjectVersion,
  ProjectVersionCreateInput,
  ProjectVersionRepository
} from "../types/project-version";

type ProjectVersionRecord = {
  canvasJson: unknown;
  createdAt: Date;
  id: string;
  ownerUserId: string;
  projectId: string;
  source: string;
  versionNumber: number;
};

export class PrismaProjectVersionRepository implements ProjectVersionRepository {
  constructor(private readonly client: PrismaClient) {}

  async create(input: ProjectVersionCreateInput): Promise<ProjectVersion> {
    const version = await this.client.$transaction(async (transaction) => {
      const latestVersion = await transaction.projectVersion.findFirst({
        orderBy: {
          versionNumber: "desc"
        },
        select: {
          versionNumber: true
        },
        where: {
          ownerUserId: input.ownerUserId,
          projectId: input.projectId
        }
      });

      return transaction.projectVersion.create({
        data: {
          canvasJson: input.canvasJson as Prisma.InputJsonValue,
          ownerUserId: input.ownerUserId,
          projectId: input.projectId,
          source: input.source,
          versionNumber: (latestVersion?.versionNumber ?? 0) + 1
        }
      });
    });

    return parseProjectVersion(version);
  }

  async findForProjectOwner(
    versionId: string,
    projectId: string,
    ownerUserId: string
  ): Promise<ProjectVersion | null> {
    const version = await this.client.projectVersion.findFirst({
      where: {
        id: versionId,
        ownerUserId,
        projectId
      }
    });

    return version ? parseProjectVersion(version) : null;
  }

  async listForProjectOwner(projectId: string, ownerUserId: string, limit: number): Promise<ProjectVersion[]> {
    const versions = await this.client.projectVersion.findMany({
      orderBy: {
        versionNumber: "desc"
      },
      take: limit,
      where: {
        ownerUserId,
        projectId
      }
    });

    return versions.map((version) => parseProjectVersion(version));
  }
}

export function createPrismaProjectVersionRepository(): ProjectVersionRepository {
  return new PrismaProjectVersionRepository(getPrisma());
}

function parseProjectVersion(version: ProjectVersionRecord): ProjectVersion {
  return projectVersionSchema.parse(version);
}
