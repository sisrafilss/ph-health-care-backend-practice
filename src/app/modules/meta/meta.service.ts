import httpStatus from "http-status";
import { prisma } from "../../../lib/prisma";
import ApiError from "../../errors/ApiError";
import { PaymentStatus, UserRole } from "../../generated/enums";
import { IJwtPayload } from "../../types/common";

const fetchedDashboardMetaData = async (user: IJwtPayload) => {
  let metadata;
  switch (user.role) {
    case UserRole.ADMIN:
      metadata = await getAdminMetaData();
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

  const barChartData = await getBarChartData();
  const piChartData = await getPiChartData();

  return {
    patientCount,
    doctorCount,
    adminCount,
    appointmentCount,
    paymentCount,
    totalRevenue,
    barChartData,
    piChartData,
  };
};

const getBarChartData = async () => {
  const appointmentCountPerMonth = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
    CAST(COUNT(*) AS INTEGER) AS count
    FROM "appointments"
    GROUP BY month
    ORDER BY month ASC
  `;

  return appointmentCountPerMonth;
};

const getPiChartData = async () => {
  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const formatedAppointmentStatusDistribution =
    appointmentStatusDistribution.map(({ status, _count }) => ({
      status,
      count: Number(_count.id),
    }));

  return formatedAppointmentStatusDistribution;
};

export const MetaService = {
  fetchedDashboardMetaData,
};
