-- DropForeignKey
ALTER TABLE "TestAttempt" DROP CONSTRAINT "TestAttempt_test_id_fkey";

-- AlterTable
ALTER TABLE "TestAttempt" ALTER COLUMN "test_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "Test"("id") ON DELETE SET NULL ON UPDATE CASCADE;
