import express from "express";
import { UserRole } from "../../generated/enums";
import auth from "../../middlewares/auth";
import { PatientController } from "./patient.controller";

const router = express.Router();

router.get("/", auth(UserRole.ADMIN), PatientController.getAllPatientsFromDB);

router.get("/me", auth(UserRole.PATIENT), PatientController.getPatientDetail);

router.get("/:id", auth(UserRole.ADMIN), PatientController.getPatientByID);

router.patch(
  "/",
  auth(UserRole.PATIENT),
  PatientController.updatePatientIntoDB,
);
router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  PatientController.deletePatientFromDB,
);

export const patientRoutes = router;
