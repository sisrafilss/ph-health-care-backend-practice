import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../../lib/prisma";
import ApiError from "../../errors/ApiError";
import { AppointmentStatus, UserRole } from "../../generated/enums";
import { AppointmentWhereInput } from "../../generated/models";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { stripe } from "../../helpers/stripe";
import { IJwtPayload } from "../../types/common";

const createAppointment = async (
  user: IJwtPayload,
  payload: { doctorId: string; scheduleId: string },
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: payload.doctorId,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId = uuidv4();

  const result = await prisma.$transaction(async (tnx) => {
    const appointmentData = await tnx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
    });

    await tnx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    const transactionId = uuidv4();
    const paymentData = await tnx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items: [
        {
          quantity: 1,

          price_data: {
            currency: "bdt",

            product_data: {
              name: `Appointment with ${doctorData.name}`,
            },

            unit_amount: doctorData.appointmentFee * 100,
          },
        },
      ],

      success_url:
        "http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}",

      cancel_url: "http://localhost:3000/payment-cancel",

      metadata: {
        appointmentId: appointmentData.id,
        paymentId: paymentData.id,
      },
    });

    return {
      paymentURL: session.url,
    };
  });

  return result;
};

const getMyAppointments = async (
  user: IJwtPayload,
  filter: any,
  options: IOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { ...filterData } = filter;

  const andCondition: AppointmentWhereInput[] = [];

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

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: filterData[key],
      },
    }));
    andCondition.push(...filterConditions);
  }

  const whereCondition: AppointmentWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.appointment.findMany({
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

  const total = await prisma.appointment.count({
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

// get all appointments by admin
const getAllAppointments = async (filter: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { ...filterData } = filter;

  const andCondition: AppointmentWhereInput[] = [];

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: filterData[key],
      },
    }));
    andCondition.push(...filterConditions);
  }

  const whereCondition: AppointmentWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.appointment.findMany({
    skip,
    take: limit,
    where: whereCondition,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  const total = await prisma.appointment.count({
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

const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  user: IJwtPayload,
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
    },
    include: {
      doctor: true,
    },
  });

  if (user.role === UserRole.DOCTOR) {
    if (!(user.email === appointmentData.doctor.email)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "This is not your appointment",
      );
    }
  }

  return await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status,
    },
  });
};

export const AppointmentService = {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointmentStatus,
};
