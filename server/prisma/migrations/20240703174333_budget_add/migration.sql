-- CreateTable
CREATE TABLE "Budget" (
    "id" SERIAL NOT NULL,
    "budgetName" TEXT NOT NULL,
    "budgetAmount" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
