-- CreateTable
CREATE TABLE "generation_costs" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "workflow" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generation_costs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "generation_costs_owner_user_id_created_at_idx" ON "generation_costs"("owner_user_id", "created_at");

-- CreateIndex
CREATE INDEX "generation_costs_project_id_idx" ON "generation_costs"("project_id");

-- AddForeignKey
ALTER TABLE "generation_costs" ADD CONSTRAINT "generation_costs_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_costs" ADD CONSTRAINT "generation_costs_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_costs" ADD CONSTRAINT "generation_costs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "content_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
