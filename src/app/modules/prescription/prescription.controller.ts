import { Request, Response } from "express";
import httpStatus from "http-status";
import { IOptions } from "../../helpers/paginationHelper";
import pick from "../../helpers/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import { PrescriptionService } from "./prescription.service";

const createPrescription = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const result = await PrescriptionService.createPrescription(
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

const getMyPrescriptions = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const filter = pick(req.query, ["followUpDate", "searchTerm"]);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

    const result = await PrescriptionService.getMyPrescriptions(
      req.user as IJwtPayload,
      filter,
      options as IOptions,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Fetched My Prescriptions Successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

export const PrescriptionController = {
  createPrescription,
  getMyPrescriptions,
};
