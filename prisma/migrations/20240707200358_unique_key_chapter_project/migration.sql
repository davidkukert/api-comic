/*
  Warnings:

  - A unique constraint covering the columns `[number,projectId]` on the table `tb_chapters` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tb_chapters_number_projectId_key" ON "tb_chapters"("number", "projectId");
