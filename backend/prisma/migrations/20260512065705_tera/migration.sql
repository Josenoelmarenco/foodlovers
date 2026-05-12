-- CreateTable
CREATE TABLE "HealthMarker" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthMarker_pkey" PRIMARY KEY ("id")
);
