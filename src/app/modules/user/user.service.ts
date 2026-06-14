import bcrypt from "bcryptjs";
import { Request } from "express";
import config from "../../../config";
import { prisma } from "../../../lib/prisma";
import { UserRole, UserStatus } from "../../generated/enums";
import { UserWhereInput } from "../../generated/models";
import { fileUploader } from "../../helpers/fileUploader";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { IJwtPayload } from "../../types/common";
import { userSearchableFields } from "./user.constant";

const getAllFromDB = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = params;

  const andCondition: UserWhereInput[] = [];

  if (searchTerm) {
    andCondition.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const whereCondition: UserWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.user.findMany({
    skip,
    take: limit,
    where: whereCondition,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalCount = await prisma.user.count({
    where: whereCondition,
  });

  return {
    meta: {
      page,
      limit,
      total: totalCount,
    },
    data: result,
  };
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

const getMe = async (user: IJwtPayload) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
    },
  });

  let profileData;
  if (userData.role === UserRole.PATIENT) {
    profileData = await prisma.patient.findUnique({
      where: {
        email: userData.email,
      },
    });
  } else if (userData.role === UserRole.DOCTOR) {
    profileData = await prisma.doctor.findUnique({
      where: {
        email: userData.email,
      },
    });
  }
  if (userData.role === UserRole.ADMIN) {
    profileData = await prisma.admin.findUnique({
      where: {
        email: userData.email,
      },
    });
  }

  return {
    ...userData,
    ...profileData,
  };
};

const changeProfileStatus = async (
  id: string,
  payload: { status: UserStatus },
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updatedUserData = await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      status: payload.status,
    },
  });

  return {
    updatedUserData,
  };
};

const updateProfile = async (user: IJwtPayload, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  let updatedData;
  if (user.role === UserRole.PATIENT) {
    updatedData = await prisma.patient.update({
      where: {
        email: userData.email,
      },
      data: {
        ...payload,
      },
    });
  } else if (user.role === UserRole.DOCTOR) {
    updatedData = await prisma.doctor.update({
      where: {
        email: userData.email,
      },
      data: {
        ...payload,
      },
    });
  } else if (user.role === UserRole.ADMIN) {
    updatedData = await prisma.admin.update({
      where: {
        email: userData.email,
      },
      data: {
        ...payload,
      },
    });
  }

  return updatedData;
};

export const UserService = {
  createPatient,
  createDoctor,
  createAdmin,
  getAllFromDB,
  getMe,
  changeProfileStatus,
  updateProfile,
};
