CREATE TABLE "brand_memories" (
  "id" TEXT NOT NULL,
  "brand_id" TEXT NOT NULL,
  "voice" TEXT,
  "audience" TEXT,
  "products_services" TEXT,
  "brand_rules" TEXT,
  "preferred_ctas" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "brand_memories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "brand_memories_brand_id_key" ON "brand_memories"("brand_id");

ALTER TABLE "brand_memories"
  ADD CONSTRAINT "brand_memories_brand_id_fkey"
  FOREIGN KEY ("brand_id") REFERENCES "brands"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
