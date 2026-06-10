import { prisma } from "../../../lib/prisma";
import { PatientWhereInput } from "../../generated/models";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { IJwtPayload } from "../../types/common";
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

const getPatientDetail = async (user: IJwtPayload) => {
  return prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
    include: {
      patientHealthData: true,
      medicalReport: true,
    },
  });
};

const updatePatientIntoDB = async (user: IJwtPayload, payload: any) => {
  const { medicalReport, patientHealthData, ...patientData } = payload;

  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  return await prisma.$transaction(async (tnx) => {
    await tnx.patient.update({
      where: {
        email: user.email,
      },
      data: patientData,
    });

    await tnx.patientHealthData.upsert({
      where: {
        patientId: patientInfo.id,
      },
      update: {
        ...patientHealthData,
      },
      create: {
        ...patientHealthData,
        patientId: patientInfo.id,
      },
    });

    await tnx.medicalReport.create({
      data: {
        ...medicalReport,
        patientId: patientInfo.id,
      },
    });

    const result = tnx.patient.findUnique({
      where: {
        id: patientInfo.id,
      },
      include: {
        patientHealthData: true,
        medicalReport: true,
      },
    });
    return result;
  });
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
  getPatientDetail,
};
