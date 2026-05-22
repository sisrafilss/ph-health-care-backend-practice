import express from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { doctorScheduleRoutes } from "../modules/doctor-schedule/doctor-schedule.routes";
import { doctorRoutes } from "../modules/doctor/doctor.routes";
import { scheduleRoutes } from "../modules/schedule/schedule.routes";
import { specialtiesRoutes } from "../modules/specialties/specialties.routes";
import { userRoutes } from "../modules/user/user.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/schedule",
    route: scheduleRoutes,
  },
  {
    path: "/doctor-schedule",
    route: doctorScheduleRoutes,
  },
  {
    path: "/specialties",
    route: specialtiesRoutes,
  },
  {
    path: "/doctor",
    route: doctorRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
