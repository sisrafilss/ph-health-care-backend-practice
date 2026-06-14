import httpStatus from "http-status";
import { prisma } from "../../../lib/prisma";
import ApiError from "../../errors/ApiError";
import { ReviewWhereInput } from "../../generated/models";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { IJwtPayload } from "../../types/common";

const createReview = async (
  user: IJwtPayload,
  payload: { appointmentId: string; rating: number; comment: string },
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
  });

  if (patientData.id !== appointmentData.patientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This is not your appointment");
  }

  return await prisma.$transaction(async (tnx) => {
    const result = await tnx.review.create({
      data: {
        appointmentId: appointmentData.id,
        doctorId: appointmentData.doctorId,
        patientId: appointmentData.patientId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    const avgRating = await tnx.review.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        doctorId: appointmentData.doctorId,
      },
    });

    await tnx.doctor.update({
      where: {
        id: appointmentData.doctorId,
      },
      data: {
        averageRating: avgRating._avg.rating as number,
      },
    });

    return result;
  });
};

const getAllReivews = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { ...filterData } = params;

  const andCondition: ReviewWhereInput[] = [];

  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const whereCondition: ReviewWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.review.findMany({
    skip,
    take: limit,
    where: whereCondition,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      patient: true,
      doctor: true,
      appointment: true,
    },
  });

  const totalCount = await prisma.review.count({ where: whereCondition });

  return {
    meta: {
      page,
      limit,
      total: totalCount,
    },
    data: result,
  };
};

export const ReviewService = {
  createReview,
  getAllReivews,
};
