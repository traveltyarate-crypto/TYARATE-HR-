-- CreateEnum
CREATE TYPE "RewardDeductionType" AS ENUM ('REWARD', 'DEDUCTION');

-- CreateEnum
CREATE TYPE "IssuancePeriodType" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "reward_deductions" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "RewardDeductionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_deductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "previousTitle" TEXT NOT NULL,
    "newTitle" TEXT NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "note" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issuance_records" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "periodType" "IssuancePeriodType" NOT NULL,
    "periodStart" DATE NOT NULL,
    "count" INTEGER NOT NULL,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issuance_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reward_deductions_employeeId_date_idx" ON "reward_deductions"("employeeId", "date");

-- CreateIndex
CREATE INDEX "promotions_employeeId_effectiveDate_idx" ON "promotions"("employeeId", "effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "issuance_records_employeeId_periodType_periodStart_key" ON "issuance_records"("employeeId", "periodType", "periodStart");

-- AddForeignKey
ALTER TABLE "reward_deductions" ADD CONSTRAINT "reward_deductions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_deductions" ADD CONSTRAINT "reward_deductions_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issuance_records" ADD CONSTRAINT "issuance_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issuance_records" ADD CONSTRAINT "issuance_records_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

