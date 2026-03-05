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
      variables?.score || variables?.mark || variables?.percentage,
    );

    if (!isNaN(scoreValue) && scoreValue < 45) {
      console.log(
        `🚫 Email blocked. Student score ${scoreValue} is below passing (45).`,
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
     * IN BOTH SUBJECT AND CONTENT
     * =====================================================
     */
    let processedSubject = subject;
    let processedContent = content;

    // Log variables being used
    console.log("📝 Variables for replacement:", variables);

    // Replace in subject
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{${key}}`, "g");
      if (processedSubject.match(regex)) {
        console.log(
          `🔄 Replacing {${key}} with "${variables[key]}" in subject`,
        );
        processedSubject = processedSubject.replace(regex, variables[key]);
      }
    });

    // Replace in content
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{${key}}`, "g");
      if (processedContent.match(regex)) {
        console.log(
          `🔄 Replacing {${key}} with "${variables[key]}" in content`,
        );
        processedContent = processedContent.replace(regex, variables[key]);
      }
    });
    const subjectMatches: string[] = processedSubject.match(/{[^}]+}/g) ?? [];
    const contentMatches: string[] = processedContent.match(/{[^}]+}/g) ?? [];

    const remainingPlaceholders = [...subjectMatches, ...contentMatches];

    if (remainingPlaceholders.length > 0) {
      console.log(
        "⚠️ Warning: Unreplaced placeholders:",
        remainingPlaceholders,
      );
    }

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
     * MAIL OPTIONS - USE PROCESSED SUBJECT
     * =====================================================
     */
    const mailOptions: any = {
      from: `"Cybernaut EdTech Pvt. Ltd." <${fromEmail}>`,
      to,
      subject: processedSubject, // ✅ Use the processed subject
      attachments,
      ...(isHtml ? { html: processedContent } : { text: processedContent }),
    };

    console.log("📧 Final subject:", processedSubject);

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
