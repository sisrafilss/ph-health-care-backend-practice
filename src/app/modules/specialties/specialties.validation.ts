import z from "zod";

const createSpecialtiesZodSchema = z.object({
    title: z.string("Title is require")
})

export const SpecialtiesValidation = {
    createSpecialtiesZodSchema
}