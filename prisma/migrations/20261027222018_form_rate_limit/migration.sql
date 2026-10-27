-- CreateTable
CREATE TABLE "app"."rate_limit" (
    "key" TEXT NOT NULL,
    "window_start" TIMESTAMPTZ(3) NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "rate_limit_pkey" PRIMARY KEY ("key","window_start")
);

-- CreateIndex
CREATE INDEX "rate_limit_window_start_idx" ON "app"."rate_limit"("window_start");
