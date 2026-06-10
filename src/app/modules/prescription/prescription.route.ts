import express from "express";
import { UserRole } from "../../generated/enums";
import auth from "../../middlewares/auth";
import { PrescriptionController } from "./prescription.controller";

const router = express.Router();

router.get(
  "/my-prescriptions",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  PrescriptionController.getMyPrescriptions,
);

router.post(
  "/",
  auth(UserRole.DOCTOR),
  PrescriptionController.createPrescription,
);

export const prescriptionRoutes = router;
