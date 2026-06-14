import { Request, Response } from "express";
import httpStatus from "http-status";
import { IOptions } from "../../helpers/paginationHelper";
import pick from "../../helpers/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import { ReviewService } from "./review.service";

const createReview = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const result = await ReviewService.createReview(
      req.user as IJwtPayload,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Review Created Sucessfully",
      data: result,
    });
  },
);

const getAllReivews = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const filter = pick(req.query, ["rating"]);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

    const result = await ReviewService.getAllReivews(
      filter,
      options as IOptions,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All reviews fetched successfully",
      data: result,
    });
  },
);

export const ReviewController = {
  createReview,
  getAllReivews,
};
