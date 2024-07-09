-- CreateTable
CREATE TABLE "tb_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "tb_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_tb_rel_projects_tags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_tags_slug_key" ON "tb_tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_tb_rel_projects_tags_AB_unique" ON "_tb_rel_projects_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_tb_rel_projects_tags_B_index" ON "_tb_rel_projects_tags"("B");

-- AddForeignKey
ALTER TABLE "_tb_rel_projects_tags" ADD CONSTRAINT "_tb_rel_projects_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "tb_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tb_rel_projects_tags" ADD CONSTRAINT "_tb_rel_projects_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "tb_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
