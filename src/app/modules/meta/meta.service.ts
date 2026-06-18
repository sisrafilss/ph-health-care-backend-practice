import httpStatus from "http-status";
import { prisma } from "../../../lib/prisma";
import ApiError from "../../errors/ApiError";
import { PaymentStatus, UserRole } from "../../generated/enums";
import { IJwtPayload } from "../../types/common";

const fetchedDashboardMetaData = async (user: IJwtPayload) => {
  let metadata;
  switch (user.role) {
    case UserRole.ADMIN:
      metadata = "Admin Meta Data";
      break;
    case UserRole.DOCTOR:
      metadata = "Doctor meta data";
      break;
    case UserRole.PATIENT:
      metadata = "Patient meta data";
      break;
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user role!");
  }

  return metadata;
};

const getAdminMetaData = async () => {
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const adminCount = await prisma.admin.count();
  const appointmentCount = await prisma.appointment.count();
  const paymentCount = await prisma.payment.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });
};

export const MetaService = {
  fetchedDashboardMetaData,
};
