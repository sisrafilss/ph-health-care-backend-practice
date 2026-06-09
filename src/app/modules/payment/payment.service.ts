import httpStatus from "http-status";
import Stripe from "stripe";
import config from "../../../config";
import { prisma } from "../../../lib/prisma";
import ApiError from "../../errors/ApiError";
import { PaymentStatus } from "../../generated/enums";
import { stripe } from "../../helpers/stripe";

const handleStripeWebhook = async (payload: Buffer, signature: string) => {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripe_webhook_secret as string,
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;

      if (!appointmentId) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Appointment ID not found in metadata",
        );
      }

      // Check if already processed
      const existingPayment = await prisma.payment.findFirst({
        where: {
          transactionId: session.payment_intent as string,
        },
      });

      if (existingPayment) {
        return {
          received: true,
          message: "Already processed",
        };
      }

      // Update appointment
      await prisma.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          paymentStatus: PaymentStatus.PAID,
        },
      });

      // Update payment status
      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: PaymentStatus.PAID,
        },
      });

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log(`Checkout session expired: ${session.id}`);

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      console.log(`Payment failed: ${paymentIntent.id}`);

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return {
    received: true,
  };
};

export const PaymentService = {
  handleStripeWebhook,
};
