// app/api/contact/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  contactEmailTemplate,
  userThankYouTemplate,
} from "@/lib/emailTemplates";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.NEXT_PUBLIC_EMAIL_USER,
        pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
      },
    });

    await Promise.all([
      transporter.sendMail({
        from: `"Squamish Real Estate" <${process.env.EMAIL_USER}>`,
        to: "sean@squamish.realestate",
        subject: `New Contact: ${name}`,
        text: message,
        html: contactEmailTemplate(name, email, message),
      }),

      // Email to User (Confirmation)
      transporter.sendMail({
        from: `"Squamish Real Estate" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Thanks for connecting with Squamish Real Estate",
        html: userThankYouTemplate(name),
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ message: "Failed to send" }, { status: 500 });
  }
}
