import express from "express";
import { UserRole } from "../../generated/enums";
import auth from "../../middlewares/auth";
import { AdminController } from "./admin.controller";

const router = express.Router();

router.get("/", auth(UserRole.ADMIN), AdminController.getAllAdminFromDB);
router.get("/:id", auth(UserRole.ADMIN), AdminController.getAdminById);
router.patch("/:id", auth(UserRole.ADMIN), AdminController.updateAnAdmin);
router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  AdminController.softDeleteAdminByID,
);

export const adminRoutes = router;
