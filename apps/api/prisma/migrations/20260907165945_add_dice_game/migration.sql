-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('DICE');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('RESOLVED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "type" "GameType" NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'RESOLVED',
    "prediction" INTEGER NOT NULL,
    "result" INTEGER NOT NULL,
    "stakePaise" BIGINT NOT NULL,
    "payoutPaise" BIGINT NOT NULL DEFAULT 0,
    "referenceId" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Game_referenceId_key" ON "Game"("referenceId");
CREATE INDEX "Game_userId_createdAt_idx" ON "Game"("userId", "createdAt");
CREATE INDEX "Game_type_createdAt_idx" ON "Game"("type", "createdAt");

ALTER TABLE "Game" ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
