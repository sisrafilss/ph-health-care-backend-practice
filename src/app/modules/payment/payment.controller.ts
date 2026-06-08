import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import { PaymentService } from "./payment.service";

const handleStripeWebhook = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "Stripe signature missing",
        data: null,
      });
      return;
    }

    const result = await PaymentService.handleStripeWebhook(
      req.body,
      signature,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Payment Created Sucessfully",
      data: result,
    });
  },
);

export const PaymentController = {
  handleStripeWebhook,
};
