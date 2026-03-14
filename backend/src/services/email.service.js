// services/email.service.js
// Core transactional email service for TripFusion using Brevo (Sendinblue) API
//
// ─── Design principles ───────────────────────────────────────────────────────
//  • All public helpers are fire-and-forget (async, non-blocking)
//    → They NEVER reject or throw. API responses are never delayed by emails.
//  • The low-level sendEmail() helper is thin and re-usable.
//  • All email addresses & sender names are pulled from .env.
//
// ─── Required .env variables ────────────────────────────────────────────────
//  BREVO_API_KEY       – Brevo API key (from Brevo dashboard)
//  EMAIL_FROM          – Sender email address (must be verified in Brevo)
//  EMAIL_FROM_NAME     – Sender display name  (e.g. "TripFusion")
//  FRONTEND_URL        – Base URL for dashboard links (e.g. https://app.tripfusion.com)

import { transactionalEmailsApi, SibApiV3Sdk } from "../config/brevo.config.js";
import {
  welcomeEmailTemplate,
  bookingCreatedEmailTemplate,
  bookingApprovedEmailTemplate,
  paymentApprovedEmailTemplate,
  bookingCancelledEmailTemplate,
  paymentCancelledEmailTemplate,
} from "../utills/emailTemplates.utills.js";

// ─── Core send function ───────────────────────────────────────────────────────

/**
 * Sends a transactional HTML email via Brevo.
 *
 * This is the low-level primitive. Prefer the helper functions below.
 *
 * @param {Object} options
 * @param {string} options.toEmail       - Recipient email address
 * @param {string} options.toName        - Recipient display name
 * @param {string} options.subject       - Email subject line
 * @param {string} options.htmlContent   - Full HTML body string
 * @returns {Promise<void>}
 */
export const sendEmail = async ({ toEmail, toName, subject, htmlContent }) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    email: process.env.EMAIL_FROM,
    name: process.env.EMAIL_FROM_NAME || "TripFusion",
  };
  sendSmtpEmail.to = [{ email: toEmail, name: toName }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;

  await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Builds the user's dashboard URL using FRONTEND_URL env var. */
const dashboardUrl = () =>
  `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard`;

/**
 * Fire-and-forget wrapper.
 * Calls an async email function but never allows it to bubble up errors.
 * This ensures email failures never block or crash an API response.
 *
 * @param {Function} emailFn - async function that calls sendEmail internally
 */
const fireAndForget = (emailFn) => {
  Promise.resolve()
    .then(emailFn)
    .catch((err) =>
      console.error("[EmailService] Non-blocking email error:", err?.message || err)
    );
};

// ─── Public email helpers ────────────────────────────────────────────────────

/**
 * Sends a welcome email immediately after user registration.
 *
 * USAGE — in users.controllers.js, after User.create():
 * ─────────────────────────────────────────────────────
 *   import { sendWelcomeEmail } from "../services/email.service.js";
 *
 *   // Inside registerUser, after the user document is created:
 *   sendWelcomeEmail(createdUser); // fire-and-forget
 *
 * @param {Object} user  - Mongoose User document or plain object
 * @param {string} user.name
 * @param {string} user.email
 */
export const sendWelcomeEmail = (user) => {
  fireAndForget(async () => {
    const html = welcomeEmailTemplate({
      name: user.name,
      dashboardUrl: dashboardUrl(),
    });
    await sendEmail({
      toEmail: user.email,
      toName: user.name,
      subject: `Welcome to TripFusion, ${user.name}! 🌍`,
      htmlContent: html,
    });
    console.log(`[EmailService] Welcome email sent → ${user.email}`);
  });
};

/**
 * Sends a booking-created confirmation email (status: Pending).
 *
 * USAGE — in booking.controllers.js, after createBooking succeeds:
 * ────────────────────────────────────────────────────────────────
 *   import { sendBookingCreatedEmail } from "../services/email.service.js";
 *
 *   // Inside createBooking, after `booking = created[0]`:
 *   sendBookingCreatedEmail({ user: req.user, booking }); // fire-and-forget
 *
 * @param {Object} params
 * @param {Object} params.user     - user document (needs name + email)
 * @param {Object} params.booking  - booking document
 */
export const sendBookingCreatedEmail = ({ user, booking }) => {
  fireAndForget(async () => {
    const html = bookingCreatedEmailTemplate({
      user,
      booking,
      dashboardUrl: dashboardUrl(),
    });
    await sendEmail({
      toEmail: user.email,
      toName: user.name,
      subject: `Booking Received — ${booking.packageSnapshot?.title || "Your Trip"} [${booking.bookingCode}]`,
      htmlContent: html,
    });
    console.log(`[EmailService] Booking-created email sent → ${user.email} [${booking.bookingCode}]`);
  });
};

/**
 * Sends a booking-approved email when admin confirms the booking.
 *
 * USAGE — in adminBooking.controllers.js, after bookingStatus is set to "Confirmed":
 * ──────────────────────────────────────────────────────────────────────────────────
 *   import { sendBookingApprovedEmail } from "../services/email.service.js";
 *   import User from "../models/users.models.js";
 *
 *   // After saving the updated booking:
 *   const user = await User.findById(booking.user).select("name email");
 *   sendBookingApprovedEmail({ user, booking }); // fire-and-forget
 *
 * @param {Object} params
 * @param {Object} params.user     - user document
 * @param {Object} params.booking  - updated booking document
 */
export const sendBookingApprovedEmail = ({ user, booking }) => {
  fireAndForget(async () => {
    const html = bookingApprovedEmailTemplate({
      user,
      booking,
      dashboardUrl: dashboardUrl(),
    });
    await sendEmail({
      toEmail: user.email,
      toName: user.name,
      subject: `✅ Booking Confirmed — ${booking.packageSnapshot?.title || "Your Trip"} [${booking.bookingCode}]`,
      htmlContent: html,
    });
    console.log(`[EmailService] Booking-approved email sent → ${user.email} [${booking.bookingCode}]`);
  });
};

/**
 * Sends a payment-approved email when admin verifies the uploaded payment proof.
 *
 * USAGE — in adminBooking.controllers.js, after paymentStatus is set to "Paid":
 * ─────────────────────────────────────────────────────────────────────────────
 *   import { sendPaymentApprovedEmail } from "../services/email.service.js";
 *   import User from "../models/users.models.js";
 *
 *   // After saving the booking with paymentStatus = "Paid":
 *   const user = await User.findById(booking.user).select("name email");
 *   sendPaymentApprovedEmail({ user, booking }); // fire-and-forget
 *
 * @param {Object} params
 * @param {Object} params.user     - user document
 * @param {Object} params.booking  - booking with updated paymentStatus
 */
export const sendPaymentApprovedEmail = ({ user, booking }) => {
  fireAndForget(async () => {
    const html = paymentApprovedEmailTemplate({
      user,
      booking,
      dashboardUrl: dashboardUrl(),
    });
    await sendEmail({
      toEmail: user.email,
      toName: user.name,
      subject: `💳 Payment Verified — ${booking.packageSnapshot?.title || "Your Trip"} [${booking.bookingCode}]`,
      htmlContent: html,
    });
    console.log(`[EmailService] Payment-approved email sent → ${user.email} [${booking.bookingCode}]`);
  });
};

/**
 * Sends a booking-cancelled email (triggered by user or admin cancellation).
 *
 * USAGE — in booking.controllers.js (cancelMyBooking) or adminBooking.controllers.js:
 * ────────────────────────────────────────────────────────────────────────────────────
 *   import { sendBookingCancelledEmail } from "../services/email.service.js";
 *
 *   // After booking.bookingStatus = "Cancelled" and booking.save():
 *   sendBookingCancelledEmail({ user: req.user, booking }); // fire-and-forget
 *
 *   // For admin-side cancellation, first fetch the user:
 *   const user = await User.findById(booking.user).select("name email");
 *   sendBookingCancelledEmail({ user, booking }); // fire-and-forget
 *
 * @param {Object} params
 * @param {Object} params.user     - user document
 * @param {Object} params.booking  - cancelled booking document
 */
export const sendBookingCancelledEmail = ({ user, booking }) => {
  fireAndForget(async () => {
    const html = bookingCancelledEmailTemplate({
      user,
      booking,
      dashboardUrl: dashboardUrl(),
    });
    await sendEmail({
      toEmail: user.email,
      toName: user.name,
      subject: `Booking Cancelled — ${booking.packageSnapshot?.title || "Your Trip"} [${booking.bookingCode}]`,
      htmlContent: html,
    });
    console.log(`[EmailService] Booking-cancelled email sent → ${user.email} [${booking.bookingCode}]`);
  });
};

/**
 * Sends a payment-cancelled / refund-initiated email.
 *
 * USAGE — in adminBooking.controllers.js, when paymentStatus is set to "Refunded":
 * ─────────────────────────────────────────────────────────────────────────────────
 *   import { sendPaymentCancelledEmail } from "../services/email.service.js";
 *   import User from "../models/users.models.js";
 *
 *   // After booking.paymentStatus = "Refunded" and booking.save():
 *   const user = await User.findById(booking.user).select("name email");
 *   sendPaymentCancelledEmail({ user, booking }); // fire-and-forget
 *
 * @param {Object} params
 * @param {Object} params.user     - user document
 * @param {Object} params.booking  - booking with paymentStatus = "Refunded"
 */
export const sendPaymentCancelledEmail = ({ user, booking }) => {
  fireAndForget(async () => {
    const html = paymentCancelledEmailTemplate({
      user,
      booking,
      dashboardUrl: dashboardUrl(),
    });
    await sendEmail({
      toEmail: user.email,
      toName: user.name,
      subject: `Refund Initiated — ${booking.packageSnapshot?.title || "Your Trip"} [${booking.bookingCode}]`,
      htmlContent: html,
    });
    console.log(`[EmailService] Payment-cancelled/refund email sent → ${user.email} [${booking.bookingCode}]`);
  });
};
