import express, { NextFunction, Request, Response } from "express";
import { UserRole } from "../../generated/enums";
import { fileUploader } from "../../helpers/fileUploader";
import auth from "../../middlewares/auth";
import { UserController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = express.Router();

// GET - All users
router.get("/", auth(UserRole.ADMIN), UserController.getAllFromDB);

router.get(
  "/me",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  UserController.getMe,
);

router.post(
  "/create-patient",
  fileUploader.upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.createPatientValidationSchema.parse(
      JSON.parse(req.body.data),
    );
    return UserController.createPatient(req, res, next);
  },
);

router.post(
  "/create-doctor",
  fileUploader.upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.createDoctorValidationSchema.parse(
      JSON.parse(req.body.data),
    );
    return UserController.createDoctor(req, res, next);
  },
);

router.post(
  "/create-admin",
  fileUploader.upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.createAdminValidationSchema.parse(
      JSON.parse(req.body.data),
    );
    return UserController.createAdmin(req, res, next);
  },
);

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  UserController.changeProfileStatus,
);

export const userRoutes = router;
