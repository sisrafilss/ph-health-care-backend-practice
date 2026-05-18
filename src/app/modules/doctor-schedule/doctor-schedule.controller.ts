import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { DoctorScheduleService } from "./doctor-schedule.service";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";

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

export const DoctorScheduleController = {
  insertIntoDB,
};
