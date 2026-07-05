-- CreateTable
CREATE TABLE "ShopProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop_name" TEXT NOT NULL,
    "logo" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "bill_footer" TEXT
);
