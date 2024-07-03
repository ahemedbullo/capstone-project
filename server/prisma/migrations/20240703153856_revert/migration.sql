/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Budget` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_userId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_budgetId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_userId_fkey";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("username");

-- DropTable
DROP TABLE "Budget";

-- DropTable
DROP TABLE "Expense";
