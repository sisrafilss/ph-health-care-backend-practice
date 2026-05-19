import { prisma } from "../../../lib/prisma";
import { DoctorSchedulesWhereInput } from "../../generated/models";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { IJwtPayload } from "../../types/common";

const insertIntoDB = async (
  user: IJwtPayload,
  payload: {
    scheduleIds: string[];
  },
) => {
  const doctorData = await prisma.doctor.findFirstOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));

  return await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });
};

const getAllDoctorSchedule = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { isBooked } = params;

  const andCondition: DoctorSchedulesWhereInput[] = [];

  if (isBooked) {
    andCondition.push({
      AND: [
        {
          isBooked: true,
        },
      ],
    });
  }

  const whereCondition: DoctorSchedulesWhereInput = andCondition
    ? { AND: andCondition }
    : {};

  const result = await prisma.doctorSchedules.findMany({
    skip,
    take: limit,
    where: whereCondition,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalCount = await prisma.doctorSchedules.count({
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

export const DoctorScheduleService = {
  insertIntoDB,
  getAllDoctorSchedule,
};
