import express from "express";
import { UserRole } from "../../generated/enums";
import auth from "../../middlewares/auth";
import { DoctorController } from "./doctor.controller";

const router = express.Router();

// GET - All users
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.DOCTOR),
  DoctorController.getAllFromDB,
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.DOCTOR),
  DoctorController.updateIntoDB,
);

export const doctorRoutes = router;
