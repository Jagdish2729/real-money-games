import { Injectable, ServiceUnavailableException } from "@nestjs/common";

@Injectable()
export class OtpSmsService {
  async sendOtp(phoneNumber: string, code: string) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      if (process.env.NODE_ENV !== "production") return;
      throw new ServiceUnavailableException("OTP SMS provider is not configured");
    }

    const mobile = phoneNumber.replace(/^\+/, "");
    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.set("template_id", templateId);
    url.searchParams.set("mobile", mobile);
    url.searchParams.set("authkey", authKey);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ OTP: code }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.error("MSG91 OTP request failed", response.status, details);
      throw new ServiceUnavailableException("Unable to send OTP");
    }

    return response.json().catch(() => ({}));
  }
}
