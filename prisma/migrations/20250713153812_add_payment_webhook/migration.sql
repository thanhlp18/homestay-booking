-- CreateTable
CREATE TABLE "payment_webhooks" (
    "id" TEXT NOT NULL,
    "sepayId" INTEGER NOT NULL,
    "gateway" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "code" TEXT,
    "content" TEXT NOT NULL,
    "transferType" TEXT NOT NULL,
    "transferAmount" INTEGER NOT NULL,
    "accumulated" INTEGER NOT NULL,
    "subAccount" TEXT,
    "referenceCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookingId" TEXT,

    CONSTRAINT "payment_webhooks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payment_webhooks" ADD CONSTRAINT "payment_webhooks_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
