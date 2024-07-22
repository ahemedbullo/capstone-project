-- CreateTable
CREATE TABLE "TempExpense" (
    "id" SERIAL NOT NULL,
    "username" TEXT,
    "date" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TempExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedStatements" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UploadedStatements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UploadedStatements" ADD CONSTRAINT "UploadedStatements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
