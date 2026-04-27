import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import config from "../../../config";
import { Request } from "express";
import { fileUploader } from "../../helpers/fileUploader";
import { UserRole } from "../../generated/enums";

const getAllFromDB = async ({
  page,
  limit,
  searchTerm,
  sortBy,
  sortOrder,
  status,
  role,
}: {
  page: number;
  limit: number;
  searchTerm?: any;
  sortBy?: any;
  sortOrder: any;
  status: any;
  role: any;
}) => {
  const pageNumber = page || 1;
  const limitNumber = limit || 10;
  const skip = (pageNumber - 1) * limitNumber;

  console.log("SORT BY", sortBy, "SORT ORDER", sortOrder);

  return prisma.user.findMany({
    skip: skip,
    take: limitNumber,
    where: {
      email: {
        contains: searchTerm,
        mode: "insensitive",
      },
      role,
      status,
    },
    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : {
            createdAt: "asc",
          },
  });
};

const createPatient = async (req: Request) => {
  if (req.file) {
    const uploadedResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.patient.profilePhoto = uploadedResult?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(
    req.body.password,
    Number(config.bcrypt_salt_round),
  );

  return await prisma.$transaction(async (tnx) => {
    const res1 = await tnx.user.create({
      data: {
        email: req.body.patient.email,
        password: hashedPassword,
      },
    });

    return await tnx.patient.create({
      data: req.body.patient,
    });
  });
};

const createDoctor = async (req: Request) => {
  if (req.file) {
    const uploadedResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.doctor.profilePhoto = uploadedResult?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(
    req.body.password,
    Number(config.bcrypt_salt_round),
  );

  return await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.doctor.email,
        role: UserRole.DOCTOR,
        password: hashedPassword,
      },
    });

    return await tnx.doctor.create({
      data: req.body.doctor,
    });
  });
};

const createAdmin = async (req: Request) => {
  if (req.file) {
    const uploadedResult = await fileUploader.uploadToCloudinary(req.file);

    console.log;
    req.body.admin.profilePhoto = uploadedResult?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(
    req.body.password,
    Number(config.bcrypt_salt_round),
  );

  return await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.admin.email,
        role: UserRole.ADMIN,
        password: hashedPassword,
      },
    });
    return tnx.admin.create({
      data: req.body.admin,
    });
  });
};

export const UserService = {
  createPatient,
  createDoctor,
  createAdmin,
  getAllFromDB,
};
