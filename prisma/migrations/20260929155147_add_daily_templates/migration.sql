-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "dailyTemplateId" TEXT;

-- CreateTable
CREATE TABLE "DailyTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "categoryId" TEXT NOT NULL,
    "subtaskTitles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_dailyTemplateId_idx" ON "Task"("dailyTemplateId");

-- AddForeignKey
ALTER TABLE "DailyTemplate" ADD CONSTRAINT "DailyTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_dailyTemplateId_fkey" FOREIGN KEY ("dailyTemplateId") REFERENCES "DailyTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
