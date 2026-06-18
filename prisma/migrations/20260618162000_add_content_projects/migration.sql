CREATE TABLE "content_projects" (
  "id" TEXT NOT NULL,
  "owner_user_id" TEXT NOT NULL,
  "brand_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "format" TEXT NOT NULL DEFAULT 'instagram-carousel',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "canvas_json" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "content_projects_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "content_projects_brand_id_idx" ON "content_projects"("brand_id");
CREATE INDEX "content_projects_owner_user_id_updated_at_idx" ON "content_projects"("owner_user_id", "updated_at");

ALTER TABLE "content_projects"
  ADD CONSTRAINT "content_projects_owner_user_id_fkey"
  FOREIGN KEY ("owner_user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "content_projects"
  ADD CONSTRAINT "content_projects_brand_id_fkey"
  FOREIGN KEY ("brand_id") REFERENCES "brands"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
