import express from "express";
import { UserRole } from "../../generated/enums";
import auth from "../../middlewares/auth";
import { AppointmentController } from "./appointment.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.PATIENT),
  AppointmentController.createAppointment,
);

export const appointmentRoutes = router;
