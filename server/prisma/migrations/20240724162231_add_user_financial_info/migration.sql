/*
  Warnings:

  - You are about to drop the column `monthlySavingTarget` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "monthlySavingTarget",
ADD COLUMN     "monthlySavingsTarget" DOUBLE PRECISION;
