-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "project_id" TEXT,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "mime_type" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "size_bytes" INTEGER,
    "provider" TEXT,
    "prompt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assets_owner_user_id_created_at_idx" ON "assets"("owner_user_id", "created_at");

-- CreateIndex
CREATE INDEX "assets_brand_id_idx" ON "assets"("brand_id");

-- CreateIndex
CREATE INDEX "assets_project_id_idx" ON "assets"("project_id");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "content_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
