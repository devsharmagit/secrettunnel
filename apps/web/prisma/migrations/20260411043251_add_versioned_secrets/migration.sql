-- CreateTable
CREATE TABLE "SecretGroup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecretGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecretVersion" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecretVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SecretVersion_groupId_versionNumber_key" ON "SecretVersion"("groupId", "versionNumber");

-- AddForeignKey
ALTER TABLE "SecretVersion" ADD CONSTRAINT "SecretVersion_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "SecretGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
