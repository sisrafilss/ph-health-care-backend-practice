import express from "express";
import { UserRole } from "../../generated/enums";
import auth from "../../middlewares/auth";
import { ReviewController } from "./review.controller";

const router = express.Router();

router.get("/", ReviewController.getAllReivews);
router.post("/", auth(UserRole.PATIENT), ReviewController.createReview);

export const reviewRoutes = router;
