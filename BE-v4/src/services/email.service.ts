import nodemailer from "nodemailer";
import EmailConfig from "../modules/email/email.model";

/**
 * Send email using DB-based sender config
 * 🚫 Will NOT send if student's score < 45
 */
export const sendEmail = async (
  to: string,
  subject: string,
  content: string,
  attachments: any[] = [],
  isHtml: boolean = false,
  senderEmailId?: string,
  variables: Record<string, string> = {},
): Promise<boolean> => {
  try {
    console.log("📨 Attempting to send email...");

    /**
     * =====================================================
     * 🚫 BLOCK EMAIL IF SCORE < 45
     * =====================================================
     */
    const scoreValue = Number(
      variables?.score ||
      variables?.mark ||
      variables?.percentage
    );

    if (!isNaN(scoreValue) && scoreValue < 45) {
      console.log(
        `🚫 Email blocked. Student score ${scoreValue} is below passing (45).`
      );
      return false;
    }

    /**
     * =====================================================
     * VALIDATE SENDER CONFIG
     * =====================================================
     */
    if (!senderEmailId) {
      console.error("❌ senderEmailId not provided");
      return false;
    }

    const emailConfig = await EmailConfig.findById(senderEmailId);

    if (!emailConfig) {
      console.error("❌ Sender email config not found");
      return false;
    }

    const fromEmail = emailConfig.email;
    const fromPass = emailConfig.appPassword.trim();

    console.log("From:", fromEmail);
    console.log("To:", to);

    /**
     * =====================================================
     * REPLACE TEMPLATE VARIABLES ({name}, {course}, etc.)
     * =====================================================
     */
    let processedContent = content;

    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{${key}}`, "g");
      processedContent = processedContent.replace(regex, variables[key]);
    });

    /**
     * =====================================================
     * CREATE SMTP TRANSPORTER
     * =====================================================
     */
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: fromEmail,
        pass: fromPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    /**
     * =====================================================
     * MAIL OPTIONS
     * =====================================================
     */
    const mailOptions: any = {
      from: `"Cybernaut EdTech Pvt. Ltd." <${fromEmail}>`,
      to,
      subject,
      attachments,
      ...(isHtml
        ? { html: processedContent }
        : { text: processedContent }),
    };

    /**
     * =====================================================
     * SEND MAIL
     * =====================================================
     */
    const info = await transporter.sendMail(mailOptions);

    console.log("📬 SMTP Response:", info.response);
    console.log("📥 Accepted:", info.accepted);
    console.log("📤 Rejected:", info.rejected);
    console.log("📧 Message ID:", info.messageId);

    const isSuccessful =
      info.accepted &&
      Array.isArray(info.accepted) &&
      info.accepted.length > 0 &&
      info.accepted.includes(to);

    if (isSuccessful || info.messageId) {
      console.log("✅ Email sent successfully to:", to);
      return true;
    }

    console.error("❌ Email sending failed - no confirmation");
    return false;

  } catch (error: any) {
    console.error("❌ MAIL ERROR:", error.message);
    return false;
  }
};