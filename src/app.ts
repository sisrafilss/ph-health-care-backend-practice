import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import cron from "node-cron";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { AppointmentService } from "./app/modules/appointment/appointment.service";
import { PaymentController } from "./app/modules/payment/payment.controller";
import router from "./app/routes";
import config from "./config";

const app: Application = express();

app.post(
  "/webhook",
  express.raw({
    type: "application/json",
  }),
  PaymentController.handleStripeWebhook,
);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

cron.schedule("* * * * *", () => {
  console.log("Node Cron is called at:", new Date());
  try {
    AppointmentService.cancelUnpaidAppointments();
  } catch (err) {
    console.log(err);
  }
});

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "PH Healthcare Server is running... on PORT: " + config.port,
    environment: config.node_env,
    uptime: process.uptime().toFixed(2),
    timeStamp: new Date().toISOString(),
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
