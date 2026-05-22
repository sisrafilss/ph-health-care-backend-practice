import { prisma } from "../../../lib/prisma";
import { DoctorWhereInput } from "../../generated/models";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { doctorSearchableFields } from "./doctor.constant";
import { IDoctorUpdateInput } from "./doctor.interface";

const getAllFromDB = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, specialties, ...filterData } = params;

  const andCondition: DoctorWhereInput[] = [];

  if (searchTerm) {
    andCondition.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (specialties && specialties.length > 0) {
    andCondition.push({
      doctorSpecialities: {
        some: {
          specialtes: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
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

  const whereCondition: DoctorWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.doctor.findMany({
    skip,
    take: limit,
    where: { isDeleted: false, ...whereCondition },
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      doctorSpecialities: {
        include: {
          specialtes: true,
        },
      },
    },
  });

  const totalCount = await prisma.doctor.count({ where: whereCondition });

  return {
    meta: {
      page,
      limit,
      total: totalCount,
    },
    data: result,
  };
};

const updateIntoDB = async (
  id: string,
  payload: Partial<IDoctorUpdateInput>,
) => {
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const { specialties, ...doctorData } = payload;

  if (specialties && specialties.length > 0) {
    const deleteSpecialtyIds = specialties.filter(
      (specialty) => specialty.isDeleted,
    );
    for (const specialty of deleteSpecialtyIds) {
      await prisma.doctorSpecialties.deleteMany({
        where: {
          doctorId: id,
          specialtiesId: specialty.specialtyId,
        },
      });
    }

    const createSpecialtyIds = specialties.filter(
      (specialty) => !specialty.isDeleted,
    );
    for (const specialty of createSpecialtyIds) {
      await prisma.doctorSpecialties.createMany({
        data: {
          doctorId: id,
          specialtiesId: specialty.specialtyId,
        },
      });
    }
  }

  const updatedData = await prisma.doctor.update({
    where: {
      id: doctorInfo.id,
    },
    data: doctorData,
    include: {
      doctorSpecialities: {
        include: {
          specialtes: true,
        },
      },
    },
  });

  return updatedData;
};

const getDoctorById = async (id: string) => {
  return prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      doctorSpecialities: {
        include: {
          specialtes: true,
        },
      },
    },
  });
};

const deleteFromDB = async (id: string) => {
  await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  return await prisma.doctor.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
};

export const DoctorService = {
  getAllFromDB,
  updateIntoDB,
  getDoctorById,
  deleteFromDB,
};
