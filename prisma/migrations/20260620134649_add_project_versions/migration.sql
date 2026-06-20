-- CreateTable
CREATE TABLE "project_versions" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "canvas_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_versions_owner_user_id_created_at_idx" ON "project_versions"("owner_user_id", "created_at");

-- CreateIndex
CREATE INDEX "project_versions_project_id_created_at_idx" ON "project_versions"("project_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "project_versions_project_id_version_number_key" ON "project_versions"("project_id", "version_number");

-- AddForeignKey
ALTER TABLE "project_versions" ADD CONSTRAINT "project_versions_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_versions" ADD CONSTRAINT "project_versions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "content_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
