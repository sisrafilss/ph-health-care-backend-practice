import { Request, Response } from "express";
import httpStatus from "http-status";
import { IOptions } from "../../helpers/paginationHelper";
import pick from "../../helpers/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import { AppointmentService } from "./appointment.service";

const getAllAppointments = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const filter = pick(req.query, ["status", "paymentStatus"]);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

    const result = await AppointmentService.getAllAppointments(
      filter,
      options as IOptions,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Fetched All Appoitments Successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);
const getMyAppointments = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const filter = pick(req.query, ["status", "paymentStatus"]);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

    const result = await AppointmentService.getMyAppointments(
      req.user as IJwtPayload,
      filter,
      options as IOptions,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Fetched My Appointments Successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const createAppointment = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const result = await AppointmentService.createAppointment(
      req.user as IJwtPayload,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Appointment Created Sucessfully",
      data: result,
    });
  },
);

const updateAppointmentStatus = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const { id } = req.params;

    const result = await AppointmentService.updateAppointmentStatus(
      id as string,
      req.body.status,
      req.user as IJwtPayload,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Appointment Updated Sucessfully",
      data: result,
    });
  },
);

export const AppointmentController = {
  getMyAppointments,
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
};
