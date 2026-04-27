import z from "zod";

enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

const createPatientValidationSchema = z.object({
  password: z.string(),
  patient: z.object({
    name: z.string("Name is required"),
    email: z.email("Email is required"),
    address: z.string().optional(),
  }),
});

const createDoctorValidationSchema = z.object({
  password: z.string(),
  doctor: z.object({
    name: z.string("Name is required"),
    email: z.email("Email is required"),
    contactNumber: z.string("Contact number is required"),
    address: z.string().optional(),
    registrationNumber: z.string("Registration number is require"),
    experience: z.number().optional(),
    gender: z.enum(Gender, "Gender is require"),
    appointmentFee: z.number(
      "Appointment fee is require, and must be number value",
    ),
    qualification: z.string("Qualitifaction is require"),
    currentWorkingPlace: z.string("Current Working Place is require"),
    designation: z.string("Designation is require"),
  }),
});

const createAdminValidationSchema = z.object({
  password: z.string(),
  admin: z.object({
    name: z.string("Name is required"),
    email: z.email("Email is required"),
    contactNumber: z.string("Contact number is required"),
    address: z.string().optional(),
  }),
});

export const userValidation = {
  createPatientValidationSchema,
  createDoctorValidationSchema,
  createAdminValidationSchema,
};
