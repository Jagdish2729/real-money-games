CREATE TABLE "PaymentSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "upiId" VARCHAR(255) NOT NULL,
    "qrImageUrl" VARCHAR(1000),
    "instructions" VARCHAR(1000) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentSetting_pkey" PRIMARY KEY ("id")
);

INSERT INTO "PaymentSetting" ("id", "upiId", "qrImageUrl", "instructions", "updatedAt")
VALUES (1, '', NULL, 'Pay using the UPI ID or scan the QR code. Submit the UTR after payment.', CURRENT_TIMESTAMP);
