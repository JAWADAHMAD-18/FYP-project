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

// Send email
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

// Send email in a non-blocking way
const fireAndForget = (emailFn) => {
  Promise.resolve()
    .then(emailFn)
    .catch((err) =>
      console.error(
        "[EmailService] Non-blocking email error:",
        err?.message || err
      )
    );
};

// ─── Public email helpers ────────────────────────────────────────────────────

// Send welcome email
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

// Send booking-created email
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
    console.log(
      `[EmailService] Booking-created email sent → ${user.email} [${booking.bookingCode}]`
    );
  });
};

// Send booking-approved email
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
    console.log(
      `[EmailService] Booking-approved email sent → ${user.email} [${booking.bookingCode}]`
    );
  });
};

// Send payment-approved email
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
    console.log(
      `[EmailService] Payment-approved email sent → ${user.email} [${booking.bookingCode}]`
    );
  });
};

// Send booking-cancelled email
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
    console.log(
      `[EmailService] Booking-cancelled email sent → ${user.email} [${booking.bookingCode}]`
    );
  });
};

// Send refund-initiated email
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
    console.log(
      `[EmailService] Payment-cancelled/refund email sent → ${user.email} [${booking.bookingCode}]`
    );
  });
};
