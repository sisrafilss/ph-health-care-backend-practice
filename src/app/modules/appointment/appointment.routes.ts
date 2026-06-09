import express from "express";
import { UserRole } from "../../generated/enums";
import auth from "../../middlewares/auth";
import { AppointmentController } from "./appointment.controller";

const router = express.Router();

router.get(
  "/all",
  auth(UserRole.ADMIN),
  AppointmentController.getAllAppointments,
);
router.get(
  "/my-appointments",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  AppointmentController.getMyAppointments,
);

router.post(
  "/",
  auth(UserRole.PATIENT),
  AppointmentController.createAppointment,
);

router.patch(
  "/status/:id",
  auth(UserRole.DOCTOR, UserRole.ADMIN),
  AppointmentController.updateAppointmentStatus,
);

export const appointmentRoutes = router;
