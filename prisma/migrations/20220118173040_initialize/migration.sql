-- CreateTable
CREATE TABLE "Edge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cursor" TEXT NOT NULL,
    "tweetId" INTEGER NOT NULL,
    "responseId" INTEGER,
    CONSTRAINT "Edge_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "Tweet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Edge_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PageInfo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "endCursor" TEXT NOT NULL,
    "hasNextPage" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Response" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pageInfoId" INTEGER NOT NULL,
    CONSTRAINT "Response_pageInfoId_fkey" FOREIGN KEY ("pageInfoId") REFERENCES "PageInfo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
