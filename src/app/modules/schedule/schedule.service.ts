import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../../lib/prisma";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { ScheduleWhereInput } from "../../generated/models";
import { IJwtPayload } from "../../types/common";

const insertIntoDB = async (payload: any) => {
  const { startDate, endDate, startTime, endTime } = payload;
  const intervalTime = 30;

  const schedules = [];

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          format(currentDate, "yyyy-MM-dd"),
          Number(startTime.split(":")[0]),
        ),
        Number(startTime.split(":")[1]),
      ),
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          format(currentDate, "yyyy-MM-dd"),
          Number(endTime.split(":")[0]),
        ),
        Number(endTime.split(":")[1]),
      ),
    );

    while (startDateTime < endDateTime) {
      const slotStartDateTime = startDateTime; // 10:00
      const slotEndDateTime = addMinutes(slotStartDateTime, intervalTime);

      const scheduleData = {
        startDateTime: slotStartDateTime,
        endDateTime: slotEndDateTime,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: scheduleData,
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }
      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};

const scheduleForDoctor = async (
  user: IJwtPayload,
  params: any,
  options: IOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { startDateTime, endDateTime } = params;

  const andCondition: ScheduleWhereInput[] = [];

  if (startDateTime && endDateTime) {
    andCondition.push({
      AND: [
        {
          startDateTime: {
            gte: startDateTime,
          },
        },
        {
          endDateTime: {
            lte: endDateTime,
          },
        },
      ],
    });
  }

  const doctorSchedules = await prisma.doctorSchedules.findMany({
    where: {
      doctor: {
        email: user.email,
      },
    },
    select: {
      scheduleId: true,
    },
  });

  const scheduleIDs = doctorSchedules.map(
    (scheudleId) => scheudleId.scheduleId,
  );

  const whereCondition: ScheduleWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.schedule.findMany({
    skip,
    take: limit,
    where: {
      ...whereCondition,
      id: {
        notIn: scheduleIDs,
      },
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalCount = await prisma.schedule.count({
    where: {
      ...whereCondition,
      id: {
        notIn: scheduleIDs,
      },
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

const deleteScheduleFromDB = async (id: string) => {
  return await prisma.schedule.delete({
    where: {
      id,
    },
  });
};

export const ScheduleService = {
  insertIntoDB,
  scheduleForDoctor,
  deleteScheduleFromDB,
};
