import { Request, Response } from "express";
import httpStatus from "http-status";
import { IOptions } from "../../helpers/paginationHelper";
import pick from "../../helpers/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import { patientFilterableFields } from "./patient.constant";
import { PatientService } from "./patient.service";

const getAllPatientsFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, patientFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await PatientService.getAllPatientsFromDB(
    filters,
    options as IOptions,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Patients Fetched Successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getPatientByID = catchAsync(async (req: Request, res: Response) => {
  const result = await PatientService.getPatientByID(req.params?.id as string);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Patient Data Fetched Successfully",
    data: result,
  });
});

const getPatientDetail = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const result = await PatientService.getPatientDetail(
      req.user as IJwtPayload,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Your Data Fetched Successfully",
      data: result,
    });
  },
);

const updatePatientIntoDB = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const result = await PatientService.updatePatientIntoDB(
      req.user as IJwtPayload,
      req.body,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Patient Updated Successfully",
      data: result,
    });
  },
);
const deletePatientFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await PatientService.deletePatientFromDB(
    req.params?.id as string,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Patient Soft Deleted Successfully",
    data: result,
  });
});

export const PatientController = {
  getAllPatientsFromDB,
  getPatientByID,
  updatePatientIntoDB,
  deletePatientFromDB,
  getPatientDetail,
};
