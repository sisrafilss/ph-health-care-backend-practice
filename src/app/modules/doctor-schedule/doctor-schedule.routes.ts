import express from "express";
import { UserRole } from "../../generated/enums";
import auth from "../../middlewares/auth";
import { DoctorScheduleController } from "./doctor-schedule.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.ADMIN),
  DoctorScheduleController.getAllDoctorSchedule,
);

router.post("/", auth(UserRole.DOCTOR), DoctorScheduleController.insertIntoDB);

export const doctorScheduleRoutes = router;
