/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Creator` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Creator_name_key" ON "Creator"("name");
