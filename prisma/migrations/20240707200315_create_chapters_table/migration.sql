-- CreateTable
CREATE TABLE "tb_chapters" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT,
    "pages" JSONB NOT NULL,
    "projectId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_chapters_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tb_chapters" ADD CONSTRAINT "tb_chapters_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "tb_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
