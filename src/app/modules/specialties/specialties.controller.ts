import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { SpecialtiesService } from "./specialties.service";

const insertIntoDB = catchAsync(
    async (req: Request, res: Response) => {

        const result = await SpecialtiesService.insertIntoDB(
            req
        );

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Doctor Specialties Created Successfully",
            data: result,
        });
    },
);


export const SpecialtiesController = {
    insertIntoDB,
};
