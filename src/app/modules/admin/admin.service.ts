import { prisma } from "../../../lib/prisma";
import { AdminWhereInput } from "../../generated/models";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { adminSearchableFields } from "./admin.constant";
import { AdminInutType } from "./admin.interface";

const getAllAdminFromDB = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = params;

  const andConition: AdminWhereInput[] = [];

  if (searchTerm) {
    andConition.push({
      AND: adminSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConition.push({
      OR: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const adminWhereInput: AdminWhereInput =
    andConition.length > 0 ? { OR: andConition } : {};

  const result = await prisma.admin.findMany({
    where: adminWhereInput,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.admin.count({ where: adminWhereInput });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getAdminById = async (id: string) => {
  return await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  });
};

const updateAnAdmin = async (id: string, payload: Partial<AdminInutType>) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  });

  return await prisma.admin.update({
    where: {
      id,
    },
    data: payload,
  });
};

const softDeleteAdminByID = async (id: string) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  });

  return await prisma.admin.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
};

export const AdminService = {
  getAllAdminFromDB,
  getAdminById,
  updateAnAdmin,
  softDeleteAdminByID,
};
