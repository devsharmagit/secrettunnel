-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
