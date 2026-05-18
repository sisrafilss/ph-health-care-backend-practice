import { prisma } from "../../../lib/prisma";
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

export const DoctorScheduleService = {
  insertIntoDB,
};
