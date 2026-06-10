import { Request, Response } from "express";
import httpStatus from "http-status";
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

export const ReviewController = {
  createReview,
};
