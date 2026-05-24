import { Request, Response } from "express";
import { IOptions } from "../../helpers/paginationHelper";
import pick from "../../helpers/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { adminFilterableFields } from "./admin.constant";
import { AdminService } from "./admin.service";

const getAllAdminFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, adminFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await AdminService.getAllAdminFromDB(
    filters,
    options as IOptions,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admins Fetched Successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAdminById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAdminById(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin Fetched Successfully",
    data: result,
  });
});
const updateAnAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.updateAnAdmin(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Admin Updated Successfully",
    data: result,
  });
});
const softDeleteAdminByID = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.softDeleteAdminByID(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Admin Soft Deleted Successfully",
    data: result,
  });
});

export const AdminController = {
  getAllAdminFromDB,
  getAdminById,
  updateAnAdmin,
  softDeleteAdminByID,
};
