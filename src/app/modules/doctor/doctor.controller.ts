import { Request, Response } from "express";
import { IOptions } from "../../helpers/paginationHelper";
import pick from "../../helpers/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import { doctorFilterableFields } from "./doctor.constant";
import { DoctorService } from "./doctor.service";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, doctorFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await DoctorService.getAllFromDB(filter, options as IOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Fetched Doctors Successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorService.updateIntoDB(
    req.params?.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor's Data Updated Successfully",
    data: result,
  });
});

const getDoctorById = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorService.getDoctorById(req.params?.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor Data Fetched Successfully",
    data: result,
  });
});

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorService.deleteFromDB(req.params?.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor Soft Deleted Successfully",
    data: result,
  });
});

const getAISuggestions = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorService.getAISuggestions(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "AI Doctor Suggestions fetched successfull.",
    data: result,
  });
});

const getMySchedules = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const filter = pick(req.query, ["isBooked"]);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

    const result = await DoctorService.getMySchedules(
      req.user as IJwtPayload,
      filter,
      options as IOptions,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Fetched My Schedules Successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

export const DoctorController = {
  getAllFromDB,
  updateIntoDB,
  getDoctorById,
  deleteFromDB,
  getAISuggestions,
  getMySchedules,
};
