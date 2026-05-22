import { prisma } from "../../../lib/prisma";
import { Patient } from "../../generated/client";
import { PatientWhereInput } from "../../generated/models";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { patientSearchableFields } from "./patient.constant";

const getAllPatientsFromDB = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = params;

  const andCondition: PatientWhereInput[] = [];

  if (searchTerm) {
    andCondition.push({
      OR: patientSearchableFields.map((field) => ({
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

  const whereCondition: PatientWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.patient.findMany({
    skip,
    take: limit,
    where: { isDeleted: false, ...whereCondition },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalCount = await prisma.patient.count({
    where: { isDeleted: false, ...whereCondition },
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

const getPatientByID = async (id: string) => {
  return prisma.patient.findUniqueOrThrow({
    where: {
      id,
    },
  });
};

const updatePatientIntoDB = async (id: string, payload: Partial<Patient>) => {
  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updatedData = await prisma.patient.update({
    where: {
      id: patientInfo.id,
    },
    data: payload,
  });

  return updatedData;
};

const deletePatientFromDB = async (id: string) => {
  await prisma.patient.findUniqueOrThrow({
    where: {
      id,
    },
  });

  return await prisma.patient.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
};

export const PatientService = {
  getAllPatientsFromDB,
  getPatientByID,
  updatePatientIntoDB,
  deletePatientFromDB,
};
