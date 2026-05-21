/*
  Warnings:

  - You are about to drop the `doctor_specialites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `specialities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "doctor_specialites" DROP CONSTRAINT "doctor_specialites_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "doctor_specialites" DROP CONSTRAINT "doctor_specialites_specialitiesId_fkey";

-- DropTable
DROP TABLE "doctor_specialites";

-- DropTable
DROP TABLE "specialities";

-- CreateTable
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_specialtes" (
    "specialtiesId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,

    CONSTRAINT "doctor_specialtes_pkey" PRIMARY KEY ("specialtiesId","doctorId")
);

-- AddForeignKey
ALTER TABLE "doctor_specialtes" ADD CONSTRAINT "doctor_specialtes_specialtiesId_fkey" FOREIGN KEY ("specialtiesId") REFERENCES "specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_specialtes" ADD CONSTRAINT "doctor_specialtes_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
