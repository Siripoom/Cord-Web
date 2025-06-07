-- CreateTable
CREATE TABLE "SongImage" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SongImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SongImage_songId_order_idx" ON "SongImage"("songId", "order");

-- AddForeignKey
ALTER TABLE "SongImage" ADD CONSTRAINT "SongImage_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
