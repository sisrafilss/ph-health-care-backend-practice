import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import { MetaService } from "./meta.service";

const fetchedDashboardMetaData = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const result = await MetaService.fetchedDashboardMetaData(
      req.user as IJwtPayload,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Metadata Retrival Successfully",
      data: result,
    });
  },
);

export const MetaController = {
  fetchedDashboardMetaData,
};
