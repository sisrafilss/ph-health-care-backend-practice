import express from "express";
import { UserRole } from "../../generated/enums";
import auth from "../../middlewares/auth";
import { MetaController } from "./meta.controler";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  MetaController.fetchedDashboardMetaData,
);

export const metaRoutes = router;
