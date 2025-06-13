-- CreateTable
CREATE TABLE "SongAlbum" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "albumName" TEXT NOT NULL,
    "artist" TEXT,
    "releaseDate" TIMESTAMP(3),
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SongAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SongAlbum_songId_idx" ON "SongAlbum"("songId");

-- AddForeignKey
ALTER TABLE "SongAlbum" ADD CONSTRAINT "SongAlbum_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
