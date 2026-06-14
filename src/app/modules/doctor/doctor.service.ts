import httpStatus from "http-status";
import { prisma } from "../../../lib/prisma";
import ApiError from "../../errors/ApiError";
import {
  DoctorSchedulesWhereInput,
  DoctorWhereInput,
} from "../../generated/models";
import { extractJsonFromAIResponse } from "../../helpers/extractJsonFromAIResponse";
import { openRouterclient } from "../../helpers/openRouter";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { IJwtPayload } from "../../types/common";
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
      review: {
        select: {
          rating: true,
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
      doctorSchedule: {
        include: {
          schedule: true,
        },
      },
      review: true,
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

const getAISuggestions = async (payload: { symptoms: string }) => {
  if (!(payload && payload.symptoms)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "symptoms is required!");
  }

  const doctors = await prisma.doctor.findMany({
    where: { isDeleted: false },
    include: {
      doctorSpecialities: {
        include: {
          specialtes: true,
        },
      },
    },
  });

  const prompt = `
You are an AI medical assistant.

Patient symptoms:
"${payload.symptoms}"

Available doctors:
${JSON.stringify(doctors, null, 2)}

Your task:
1. Analyze the symptoms.
2. Suggest the MOST relevant doctors.
3. Return maximum 3 doctors.
4. Return ONLY valid JSON.
5. Do not explain anything.

Return your response in JSON format with full individual doctor data.
`;

  const completion = await openRouterclient.chat.send({
    chatRequest: {
      model: "openai/gpt-oss-120b:free",
      messages: [
        {
          role: "system",
          content: "You are an expert medical assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    },
  });

  console.log("MESSAGE: ", completion.choices[0].message.content);

  const suggestedDoctors = extractJsonFromAIResponse(
    completion.choices[0].message.content,
  );

  return { AIresponse: suggestedDoctors };
};

const getMySchedules = async (
  user: IJwtPayload,
  params: any,
  options: IOptions,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { ...filterData } = params;

  const andCondition: DoctorSchedulesWhereInput[] = [];

  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const whereCondition: DoctorSchedulesWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.doctorSchedules.findMany({
    skip,
    take: limit,
    where: {
      doctorId: doctorData.id,
      ...whereCondition,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalCount = await prisma.doctorSchedules.count({
    where: {
      doctorId: doctorData.id,
      ...whereCondition,
    },
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

const deleteSchedule = async (user: IJwtPayload, scheduleId: string) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  return await prisma.doctorSchedules.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleId,
      },
    },
  });
};

export const DoctorService = {
  getAllFromDB,
  updateIntoDB,
  getDoctorById,
  deleteFromDB,
  getAISuggestions,
  getMySchedules,
  deleteSchedule,
};
