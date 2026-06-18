CREATE TABLE "brands" (
  "id" TEXT NOT NULL,
  "owner_user_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "website_url" TEXT,
  "industry" TEXT,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "brands_owner_user_id_name_key" ON "brands"("owner_user_id", "name");
CREATE INDEX "brands_owner_user_id_idx" ON "brands"("owner_user_id");

ALTER TABLE "brands"
  ADD CONSTRAINT "brands_owner_user_id_fkey"
  FOREIGN KEY ("owner_user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
