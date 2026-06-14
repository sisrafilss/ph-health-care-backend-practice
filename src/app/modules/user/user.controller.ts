import { Request, Response } from "express";
import httpStatus from "http-status";
import { IOptions } from "../../helpers/paginationHelper";
import pick from "../../helpers/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import { userFilterableField } from "./user.constant";
import { UserService } from "./user.service";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, userFilterableField);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await UserService.getAllFromDB(filter, options as IOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Fetched All Users",
    meta: result.meta,
    data: result.data,
  });
});
const createPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createPatient(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Patient created successfully",
    data: result,
  });
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createDoctor(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor created successfully",
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createAdmin(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

const getMe = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const result = await UserService.getMe(req.user as IJwtPayload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User fetched successfully",
      data: result,
    });
  },
);

const changeProfileStatus = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const { id } = req.params;

    const result = await UserService.changeProfileStatus(
      id as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User status updated successfully",
      data: result,
    });
  },
);

const updateProfile = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const result = await UserService.updateProfile(
      req.user as IJwtPayload,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User updated successfully",
      data: result,
    });
  },
);

export const UserController = {
  createPatient,
  createDoctor,
  createAdmin,
  getAllFromDB,
  getMe,
  changeProfileStatus,
  updateProfile,
};
