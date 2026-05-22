import { Request, Response } from "express";
import { IOptions } from "../../helpers/paginationHelper";
import pick from "../../helpers/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
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

export const DoctorController = {
  getAllFromDB,
  updateIntoDB,
};
