import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const { page, limit, searchTerm, sortBy, sortOrder, status, role } = query;

  const result = await UserService.getAllFromDB({
    page: Number(page),
    limit: Number(limit),
    searchTerm,
    sortBy,
    sortOrder,
    role,
    status,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Fetched All Users",
    data: result,
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

export const UserController = {
  createPatient,
  createDoctor,
  createAdmin,
  getAllFromDB,
};
