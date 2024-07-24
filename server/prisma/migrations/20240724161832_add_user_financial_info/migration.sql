/*
  Warnings:

  - You are about to drop the `UploadedStatements` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UploadedStatements" DROP CONSTRAINT "UploadedStatements_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "annualIncomeTarget" DOUBLE PRECISION,
ADD COLUMN     "financialGoals" TEXT,
ADD COLUMN     "monthlySavingTarget" DOUBLE PRECISION;

-- DropTable
DROP TABLE "UploadedStatements";

-- CreateTable
CREATE TABLE "UploadedStatement" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UploadedStatement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UploadedStatement" ADD CONSTRAINT "UploadedStatement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
