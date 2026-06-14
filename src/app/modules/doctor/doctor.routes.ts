import express from "express";
import { UserRole } from "../../generated/enums";
import auth from "../../middlewares/auth";
import { DoctorController } from "./doctor.controller";

const router = express.Router();

router.get(
  "/",
  // auth(UserRole.ADMIN, UserRole.DOCTOR),
  DoctorController.getAllFromDB,
);

router.get(
  "/my-schedules",
  auth(UserRole.DOCTOR),
  DoctorController.getMySchedules,
);

router.get(
  "/:id",
  // auth(UserRole.ADMIN, UserRole.DOCTOR),
  DoctorController.getDoctorById,
);

router.post(
  "/suggestion",

  DoctorController.getAISuggestions,
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.DOCTOR),
  DoctorController.updateIntoDB,
);

// soft delete
router.delete("/:id", auth(UserRole.ADMIN), DoctorController.deleteFromDB);

export const doctorRoutes = router;
