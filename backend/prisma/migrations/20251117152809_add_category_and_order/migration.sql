-- AlterTable
ALTER TABLE "checklist_items" ADD COLUMN     "category" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
