-- CreateEnum
CREATE TYPE "MediaTypeProject" AS ENUM ('MANGA', 'MANHWA', 'MANHUA');

-- CreateTable
CREATE TABLE "tb_projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titles_alternatives" TEXT[],
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "adult" BOOLEAN NOT NULL,
    "authors" JSONB NOT NULL,
    "mediaType" "MediaTypeProject" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_projects_slug_key" ON "tb_projects"("slug");
