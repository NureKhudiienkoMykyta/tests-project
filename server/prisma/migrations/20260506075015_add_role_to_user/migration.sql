-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'common_user');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'common_user';
