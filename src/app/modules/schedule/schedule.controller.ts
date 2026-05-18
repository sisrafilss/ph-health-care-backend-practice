import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

import sendResponse from "../../shared/sendResponse";
import { ScheduleService } from "./schedule.service";
import pick from "../../helpers/pick";
import { IOptions } from "../../helpers/paginationHelper";
import { IJwtPayload } from "../../types/common";

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.insertIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule Created Successfully",
    data: result,
  });
});

const scheduleForDoctor = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = pick(req.query, ["startDateTime", "endDateTime"]);

    const result = await ScheduleService.scheduleForDoctor(
      req.user as IJwtPayload,
      filters,
      options as IOptions,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Schedule Created Successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const deleteScheduleFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.deleteScheduleFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule Deleted Successfully",
    data: result,
  });
});

export const ScheduleController = {
  insertIntoDB,
  scheduleForDoctor,
  deleteScheduleFromDB,
};
