import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { DoctorScheduleService } from "./doctor-schedule.service";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import pick from "../../helpers/pick";
import { IOptions } from "../../helpers/paginationHelper";

const insertIntoDB = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const result = await DoctorScheduleService.insertIntoDB(
      req.user as IJwtPayload,
      req.body,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Doctor Schedule Created Successfully",
      data: result,
    });
  },
);
const getAllDoctorSchedule = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const filters = pick(req.query, ["isBooked"]);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

    const result = await DoctorScheduleService.getAllDoctorSchedule(
      filters,
      options as IOptions,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Doctor Schedules Fetched Successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

export const DoctorScheduleController = {
  insertIntoDB,
  getAllDoctorSchedule,
};
