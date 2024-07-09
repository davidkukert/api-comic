-- CreateEnum
CREATE TYPE "RolesEnum" AS ENUM ('ADMIN', 'READER');

-- AlterTable
ALTER TABLE "tb_users" ADD COLUMN     "role" "RolesEnum" NOT NULL DEFAULT 'READER';
