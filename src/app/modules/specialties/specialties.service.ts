import { Request } from "express";
import { fileUploader } from "../../helpers/fileUploader";
import { prisma } from "../../../lib/prisma";

const insertIntoDB = async (req: Request) => {
    if (req.file) {
        const uploadToColudinary = await fileUploader.uploadToCloudinary(req.file);
        req.body.icon = uploadToColudinary?.secure_url;
    }

    const result = await prisma.specialties.create({
        data: req.body
    })
    console.log(req.body);
    return req.body;
}

export const SpecialtiesService = {
    insertIntoDB
}