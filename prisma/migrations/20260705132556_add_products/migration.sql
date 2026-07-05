/*
  Warnings:

  - You are about to drop the `ShopProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ShopProfile";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sinhala" TEXT NOT NULL,
    "aliases" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "batch" TEXT NOT NULL,
    "expiry" DATETIME NOT NULL,
    "buyingPrice" REAL NOT NULL,
    "labeledPrice" REAL NOT NULL,
    "discount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "bag50" REAL,
    "bag25" REAL,
    "bag10" REAL,
    "loosePrice" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
