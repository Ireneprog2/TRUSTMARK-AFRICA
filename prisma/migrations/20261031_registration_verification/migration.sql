CREATE TABLE "RegistrationVerification" (
    "email" TEXT NOT NULL,
    "displayName" VARCHAR(80) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "codeHash" CHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistrationVerification_pkey" PRIMARY KEY ("email")
);

CREATE INDEX "RegistrationVerification_expiresAt_idx" ON "RegistrationVerification"("expiresAt");
