import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../../lib/prisma";

import { stripe } from "../../helpers/stripe";
import { IJwtPayload } from "../../types/common";

const createAppointment = async (
  user: IJwtPayload,
  payload: { doctorId: string; scheduleId: string },
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: payload.doctorId,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId = uuidv4();

  const result = await prisma.$transaction(async (tnx) => {
    const appointmentData = await tnx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
    });

    await tnx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    const transactionId = uuidv4();
    const paymentData = await tnx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items: [
        {
          quantity: 1,

          price_data: {
            currency: "bdt",

            product_data: {
              name: `Appointment with ${doctorData.name}`,
            },

            unit_amount: doctorData.appointmentFee * 100,
          },
        },
      ],

      success_url:
        "http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}",

      cancel_url: "http://localhost:3000/payment-cancel",

      metadata: {
        appointmentId: appointmentData.id,
        paymentId: paymentData.id,
      },
    });

    return {
      paymentURL: session.url,
    };
  });

  return result;
};

export const AppointmentService = {
  createAppointment,
};
