-- CreateEnum
CREATE TYPE "NCSeverity" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- AlterTable
ALTER TABLE "non_conformities" ADD COLUMN     "observations" TEXT,
ADD COLUMN     "responsible" TEXT,
ADD COLUMN     "severity" "NCSeverity" NOT NULL DEFAULT 'MEDIA';
