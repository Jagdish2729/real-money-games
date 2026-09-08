ALTER TABLE "User" ADD COLUMN "name" VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "email" VARCHAR(255);
ALTER TABLE "User" ADD COLUMN "passwordHash" VARCHAR(255);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "PasswordReset" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "tokenHash" VARCHAR(255) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");
CREATE INDEX "PasswordReset_userId_createdAt_idx" ON "PasswordReset"("userId", "createdAt");
CREATE INDEX "PasswordReset_expiresAt_idx" ON "PasswordReset"("expiresAt");
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
