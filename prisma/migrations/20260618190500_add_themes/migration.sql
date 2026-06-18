-- CreateTable
CREATE TABLE "themes" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "palette" JSONB NOT NULL,
    "typography" JSONB NOT NULL,
    "layout" JSONB NOT NULL,
    "image_style" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "themes_project_id_key" ON "themes"("project_id");

-- CreateIndex
CREATE INDEX "themes_brand_id_idx" ON "themes"("brand_id");

-- CreateIndex
CREATE INDEX "themes_owner_user_id_updated_at_idx" ON "themes"("owner_user_id", "updated_at");

-- AddForeignKey
ALTER TABLE "themes" ADD CONSTRAINT "themes_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "themes" ADD CONSTRAINT "themes_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "themes" ADD CONSTRAINT "themes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "content_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
