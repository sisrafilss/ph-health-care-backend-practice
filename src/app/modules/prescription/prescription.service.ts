import httpStatus from "http-status";
import { prisma } from "../../../lib/prisma";
import ApiError from "../../errors/ApiError";
import {
  AppointmentStatus,
  PaymentStatus,
  Prescription,
  UserRole,
} from "../../generated/client";
import { PrescriptionWhereInput } from "../../generated/models";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { IJwtPayload } from "../../types/common";

const createPrescription = async (
  user: IJwtPayload,
  payload: Partial<Prescription>,
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      doctor: true,
    },
  });

  if (user.role === UserRole.DOCTOR) {
    if (!(user.email === appointmentData.doctor.email)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "This is not your appointment!",
      );
    }
  }

  const prescriptionData = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      instructions: payload.instructions as string,
      followUpDate: payload.followUpDate,
    },
  });

  return prescriptionData;
};

const getMyPrescriptions = async (
  user: IJwtPayload,
  filter: any,
  options: IOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filter;

  const andCondition: PrescriptionWhereInput[] = [];

  if (user.role === UserRole.PATIENT) {
    andCondition.push({
      patient: {
        email: user.email,
      },
    });
  } else if (user.role === UserRole.DOCTOR) {
    andCondition.push({
      doctor: {
        email: user.email,
      },
    });
  }

  if (searchTerm) {
    andCondition.push({
      OR: ["instructions"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: filterData[key],
      },
    }));
    andCondition.push(...filterConditions);
  }

  const whereCondition: PrescriptionWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.prescription.findMany({
    skip,
    take: limit,
    where: whereCondition,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include:
      user.role === UserRole.PATIENT
        ? {
            doctor: true,
          }
        : {
            patient: true,
          },
  });

  const total = await prisma.prescription.count({
    where: whereCondition,
  });

  return {
    meta: {
      total,
      limit,
      page,
    },
    data: result,
  };
};

export const PrescriptionService = {
  createPrescription,
  getMyPrescriptions,
};
