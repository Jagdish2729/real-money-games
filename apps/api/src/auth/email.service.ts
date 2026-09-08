import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  async sendPasswordReset(to: string, name: string, resetUrl: string) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM ?? user;

    if (!host || !user || !pass || !from) {
      throw new ServiceUnavailableException("Email service is not configured yet");
    }

    const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
    await transporter.sendMail({
      from,
      to,
      subject: "Reset your RollRush password",
      text: `Hi ${name || "there"},\n\nUse this link to reset your RollRush password:\n${resetUrl}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Reset your RollRush password</h2><p>Hi ${name || "there"},</p><p>Click the button below to create a new password. This link expires in 30 minutes.</p><p><a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px">Reset Password</a></p><p style="color:#777;font-size:12px">If you did not request this, you can ignore this email.</p></div>`,
    });
  }
}
