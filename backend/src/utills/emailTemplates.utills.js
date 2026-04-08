
const BRAND_COLOR = "#0A1A44";
const ACCENT_COLOR = "#2563EB";
const BG_COLOR = "#F8FAFC";
const BORDER_COLOR = "#E2E8F0";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "PKR" }).format(
    amount ?? 0
  );

// Format date to "month day, year"
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Wrap email in HTML
const wrapEmail = (bodyContent, previewText = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>TripFusion</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: ${BG_COLOR}; color: #1E293B; -webkit-text-size-adjust: 100%; }
    a { color: ${ACCENT_COLOR}; text-decoration: none; }
    @media (max-width: 600px) {
      .email-container { width: 100% !important; padding: 0 !important; }
      .content-card { border-radius: 0 !important; }
      .detail-grid { display: block !important; }
      .detail-cell { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
    }
  </style>
</head>
<body style="background:${BG_COLOR}; margin:0; padding:0;">
  <!-- Preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;color:${BG_COLOR};">${previewText}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG_COLOR}; min-height:100vh;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:${BRAND_COLOR}; border-radius:12px 12px 0 0; padding:28px 40px; text-align:center;">
              <span style="font-size:24px; font-weight:800; color:#FFFFFF; letter-spacing:-0.5px;">✈️ TripFusion</span>
              <p style="color:rgba(255,255,255,0.65); font-size:12px; margin-top:4px; letter-spacing:0.5px; text-transform:uppercase;">Your Travel, Perfectly Managed</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="content-card" style="background:#FFFFFF; border:1px solid ${BORDER_COLOR}; border-top:none; border-radius:0 0 12px 12px; padding:40px;">
              ${bodyContent}

              <!-- Support section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px; border-top:1px solid ${BORDER_COLOR}; padding-top:28px;">
                <tr>
                  <td style="background:#F1F5F9; border-radius:10px; padding:20px 24px; text-align:center;">
                    <p style="font-size:14px; color:#475569; line-height:1.6;">
                      💬 <strong>Need help?</strong> Login to your dashboard and start a chat with our support team — we're here 24/7.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px; text-align:center;">
                <tr>
                  <td><p style="font-size:12px; color:#94A3B8; line-height:1.8;">
                    © ${new Date().getFullYear()} TripFusion. All rights reserved.<br/>
                    You are receiving this email because you have an active account or booking on TripFusion.
                  </p></td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// Render status badge
const statusBadge = (label, color = "blue") => {
  const colors = {
    green: { bg: "#DCFCE7", text: "#166534" },
    yellow: { bg: "#FEF9C3", text: "#854D0E" },
    red: { bg: "#FEE2E2", text: "#991B1B" },
    blue: { bg: "#DBEAFE", text: "#1E40AF" },
    gray: { bg: "#F1F5F9", text: "#475569" },
  };
  const { bg, text } = colors[color] || colors.blue;
  return `<span style="display:inline-block;background:${bg};color:${text};font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.3px;">${label}</span>`;
};

// Render detail row
const detailRow = (label, value) => `
  <tr>
    <td style="padding:10px 0; border-bottom:1px solid ${BORDER_COLOR}; font-size:13px; color:#64748B; white-space:nowrap; vertical-align:top; padding-right:16px;">${label}</td>
    <td style="padding:10px 0; border-bottom:1px solid ${BORDER_COLOR}; font-size:13px; color:#0F172A; font-weight:600; vertical-align:top;">${value}</td>
  </tr>`;


const bookingDetailsBlock = (booking) => {
  const snap = booking.packageSnapshot || {};
  const nights = snap.durationDays ? snap.durationDays - 1 : 0;
  const bookingStatusColor =
    booking.bookingStatus === "Confirmed"
      ? "green"
      : booking.bookingStatus === "Cancelled"
      ? "red"
      : "yellow";
  const paymentStatusColor =
    booking.paymentStatus === "Paid"
      ? "green"
      : booking.paymentStatus === "Refunded"
      ? "blue"
      : "yellow";

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; border:1px solid ${BORDER_COLOR}; border-radius:10px; overflow:hidden;">
    <tr>
      <td style="background:#F8FAFC; padding:14px 20px; border-bottom:1px solid ${BORDER_COLOR};">
        <span style="font-size:13px; font-weight:700; color:${BRAND_COLOR}; text-transform:uppercase; letter-spacing:0.5px;">Booking Details</span>
      </td>
    </tr>
    <tr>
      <td style="padding:0 20px 4px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow("Booking Code", `<code style="font-family:monospace;background:#F1F5F9;padding:2px 8px;border-radius:4px;">${booking.bookingCode || "—"}</code>`)}
          ${detailRow("Package", snap.title || "—")}
          ${detailRow("Destination", snap.destination || "—")}
          ${detailRow("Duration", snap.durationDays ? `${snap.durationDays} Days / ${nights} Nights` : "—")}
          ${detailRow("Travel Date", formatDate(booking.travelDate))}
          ${detailRow("Travellers", `${booking.numPeople || 1} Person${(booking.numPeople || 1) > 1 ? "s" : ""}`)}
          ${detailRow("Price / Person", formatPrice(booking.pricePerPerson))}
          ${detailRow("Total Price", `<span style="font-size:16px;font-weight:800;color:${BRAND_COLOR};">${formatPrice(booking.totalPrice)}</span>`)}
          ${booking.savings > 0 ? detailRow("You Saved", `<span style="color:#16A34A;font-weight:700;">🎉 ${formatPrice(booking.savings)}</span>`) : ""}
          ${detailRow("Booking Status", statusBadge(booking.bookingStatus || "Pending", bookingStatusColor))}
          ${detailRow("Payment Status", statusBadge(booking.paymentStatus || "NotPaid", paymentStatusColor))}
        </table>
      </td>
    </tr>
  </table>`;
};

// Render CTA button
const ctaButton = (href, label) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px auto 0; text-align:center;">
    <tr>
      <td style="border-radius:10px; background:${BRAND_COLOR};">
        <a href="${href}" target="_blank" style="display:inline-block; padding:14px 36px; font-size:15px; font-weight:700; color:#FFFFFF; text-decoration:none; letter-spacing:0.3px;">${label} →</a>
      </td>
    </tr>
  </table>`;

// ─── Email Templates ──────────────────────────────────────────────────────────
// Welcome email
export const welcomeEmailTemplate = ({ name, dashboardUrl }) =>
  wrapEmail(
    `
    <h1 style="font-size:26px; font-weight:800; color:${BRAND_COLOR}; line-height:1.3;">
      Welcome to TripFusion, ${name}! 🌍
    </h1>
    <p style="font-size:15px; color:#475569; margin-top:12px; line-height:1.7;">
      Your account is ready. You can now browse exclusive travel packages, manage your bookings, and plan your perfect journey — all from one place.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px; background:#F0F7FF; border-radius:10px; padding:20px 24px; border-left:4px solid ${ACCENT_COLOR};">
      <tr>
        <td>
          <p style="font-size:14px; font-weight:700; color:${BRAND_COLOR}; margin-bottom:8px;">🚀 Get started in 3 steps:</p>
          <ol style="font-size:13px; color:#475569; padding-left:18px; line-height:2;">
            <li>Generate a personalized Package and get ready to book with one click</li>
            <li>Explore our curated travel packages</li>
            <li>Pick your ideal trip and book with one click</li>
            <li>Upload your payment proof and we'll handle the rest</li>
          </ol>
        </td>
      </tr>
    </table>

    ${ctaButton(dashboardUrl, "Go to My Dashboard")}
  `,
    `Welcome aboard, ${name}! Your TripFusion account is ready.`
  );

// Booking created email
export const bookingCreatedEmailTemplate = ({ user, booking, dashboardUrl }) =>
  wrapEmail(
    `
    <h1 style="font-size:24px; font-weight:800; color:${BRAND_COLOR}; line-height:1.3;">
      Booking Received! 🎒
    </h1>
    <p style="font-size:15px; color:#475569; margin-top:10px; line-height:1.7;">
      Hi <strong>${user.name}</strong>, your booking request has been received and is currently <strong>pending review</strong>. Please complete the payment process to confirm your trip.
    </p>

    ${bookingDetailsBlock(booking)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; background:#FFFBEB; border-radius:10px; padding:18px 22px; border-left:4px solid #F59E0B;">
      <tr><td>
        <p style="font-size:13px; color:#92400E; line-height:1.7;">
          ⏳ <strong>Next Step:</strong> Please upload your payment proof via your dashboard to proceed with booking confirmation. Your slot is reserved for a limited time.
        </p>
      </td></tr>
    </table>

    ${ctaButton(dashboardUrl, "View My Booking")}
  `,
    `Booking received for ${booking.packageSnapshot?.title || "your trip"} — Pending Review.`
  );

// Booking approved email
export const bookingApprovedEmailTemplate = ({ user, booking, dashboardUrl }) =>
  wrapEmail(
    `
    <h1 style="font-size:24px; font-weight:800; color:#166534; line-height:1.3;">
      Booking Confirmed! ✅
    </h1>
    <p style="font-size:15px; color:#475569; margin-top:10px; line-height:1.7;">
      Great news, <strong>${user.name}</strong>! Your booking has been <strong style="color:#166534;">confirmed</strong>. Your adventure is officially on the calendar. Get ready to explore!
    </p>

    ${bookingDetailsBlock(booking)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; background:#F0FFF4; border-radius:10px; padding:18px 22px; border-left:4px solid #22C55E;">
      <tr><td>
        <p style="font-size:13px; color:#166534; line-height:1.7;">
          🎉 <strong>You're all set!</strong> Our team will be in touch closer to your travel date with full trip details, itinerary, and any documents you may need.
        </p>
      </td></tr>
    </table>

    ${ctaButton(dashboardUrl, "View My Confirmed Booking")}
  `,
    `Your booking for ${booking.packageSnapshot?.title || "your trip"} is confirmed!`
  );

// Payment approved email
export const paymentApprovedEmailTemplate = ({ user, booking, dashboardUrl }) =>
  wrapEmail(
    `
    <h1 style="font-size:24px; font-weight:800; color:#1E40AF; line-height:1.3;">
      Payment Verified! 💳
    </h1>
    <p style="font-size:15px; color:#475569; margin-top:10px; line-height:1.7;">
      Hi <strong>${user.name}</strong>, your payment has been <strong style="color:#1D4ED8;">successfully verified</strong> by our team. Your booking is now fully paid and confirmed.
    </p>

    ${bookingDetailsBlock(booking)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; background:#EFF6FF; border-radius:10px; padding:18px 22px; border-left:4px solid ${ACCENT_COLOR};">
      <tr><td>
        <p style="font-size:13px; color:#1E40AF; line-height:1.7;">
          🏦 Your payment of <strong>${
            new Intl.NumberFormat("en-US", { style: "currency", currency: "PKR" }).format(booking.totalPrice ?? 0)
          }</strong> has been received and recorded. Keep this email as your payment confirmation receipt.
        </p>
      </td></tr>
    </table>

    ${ctaButton(dashboardUrl, "View My Booking")}
  `,
    `Payment verified for ${booking.packageSnapshot?.title || "your trip"} — You're all set!`
  );

// Booking cancelled email
export const bookingCancelledEmailTemplate = ({ user, booking, dashboardUrl }) => {
  const cancelledByText =
    booking.cancelledBy === "Admin"
      ? "cancelled by our team"
      : "cancelled as per your request";
  return wrapEmail(
    `
    <h1 style="font-size:24px; font-weight:800; color:#991B1B; line-height:1.3;">
      Booking Cancelled
    </h1>
    <p style="font-size:15px; color:#475569; margin-top:10px; line-height:1.7;">
      Hi <strong>${user.name}</strong>, your booking has been <strong style="color:#991B1B;">${cancelledByText}</strong>.
      ${booking.cancelReason ? `<br/><br/>Reason: <em>"${booking.cancelReason}"</em>` : ""}
    </p>

    ${bookingDetailsBlock(booking)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; background:#FFF5F5; border-radius:10px; padding:18px 22px; border-left:4px solid #EF4444;">
      <tr><td>
        <p style="font-size:13px; color:#991B1B; line-height:1.7;">
          If you believe this is an error or need further assistance, please contact our support team from your dashboard.
          ${booking.paymentStatus === "Paid" ? "<br/><br/>💰 A <strong>refund</strong> will be processed to your account within 5–7 business days." : ""}
        </p>
      </td></tr>
    </table>

    ${ctaButton(dashboardUrl, "View My Bookings")}
  `,
    `Your booking for ${booking.packageSnapshot?.title || "your trip"} has been cancelled.`
  );
};

// Payment cancelled email
export const paymentCancelledEmailTemplate = ({ user, booking, dashboardUrl }) =>
  wrapEmail(
    `
    <h1 style="font-size:24px; font-weight:800; color:#6D28D9; line-height:1.3;">
      Refund Initiated 💜
    </h1>
    <p style="font-size:15px; color:#475569; margin-top:10px; line-height:1.7;">
      Hi <strong>${user.name}</strong>, we have initiated a <strong>refund</strong> for your cancelled booking. The amount will be returned through your original payment method.
    </p>

    ${bookingDetailsBlock(booking)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; background:#F5F3FF; border-radius:10px; padding:18px 22px; border-left:4px solid #7C3AED;">
      <tr><td>
        <p style="font-size:13px; color:#5B21B6; line-height:1.7;">
          🔄 Refund Amount: <strong>${
            new Intl.NumberFormat("en-US", { style: "currency", currency: "PKR" }).format(booking.totalPrice ?? 0)
          }</strong><br/>
          Please allow <strong>5–7 business days</strong> for the refund to reflect in your account. If you have questions, reach out from your dashboard.
        </p>
      </td></tr>
    </table>

    ${ctaButton(dashboardUrl, "Go to Dashboard")}
  `,
    `Refund initiated for your cancelled booking — ${booking.packageSnapshot?.title || "your trip"}.`
  );

// Reset password email
export const resetPasswordTemplate = (resetUrl) =>
  wrapEmail(
    `
    <h1 style="font-size:26px; font-weight:800; color:${BRAND_COLOR}; line-height:1.3;">
      Reset Your Password 🔐
    </h1>
    <p style="font-size:15px; color:#475569; margin-top:12px; line-height:1.7;">
      We received a request to reset the password for your TripFusion account. Click the button below to set a new password.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px; background:#FFF7ED; border-radius:10px; padding:20px 24px; border-left:4px solid #F59E0B;">
      <tr>
        <td>
          <p style="font-size:14px; font-weight:700; color:#92400E; margin-bottom:8px;">⏳ Important:</p>
          <ul style="font-size:13px; color:#78350F; padding-left:18px; line-height:2;">
            <li>This link expires in <strong>15 minutes</strong></li>
            <li>If you didn't request this, you can safely ignore this email</li>
            <li>Your password will remain unchanged until you create a new one</li>
          </ul>
        </td>
      </tr>
    </table>

    ${ctaButton(resetUrl, "Reset My Password")}
  `,
    "You requested a password reset for your TripFusion account."
  );
