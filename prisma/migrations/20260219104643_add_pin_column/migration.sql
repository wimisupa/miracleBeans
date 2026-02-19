-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "pin" TEXT NOT NULL DEFAULT '0000',
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Member" ("createdAt", "id", "name", "points", "role", "updatedAt") SELECT "createdAt", "id", "name", "points", "role", "updatedAt" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
