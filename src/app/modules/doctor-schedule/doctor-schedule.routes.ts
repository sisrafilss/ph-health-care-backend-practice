import express, { NextFunction, Request, Response } from "express";
import { DoctorScheduleController } from "./doctor-schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../../generated/enums";

const router = express.Router();

router.post("/", auth(UserRole.DOCTOR), DoctorScheduleController.insertIntoDB);

export const doctorScheduleRoutes = router;
