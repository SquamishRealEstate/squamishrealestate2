import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { masterDynamicTemplate } from "@/lib/emailTemplates";

/**
 * Sends the welcome email with the VOW regulatory documents attached.
 *
 * Triggered by a Supabase Database Webhook on INSERT into the `profiles`
 * table (fires for every new registration). The webhook must send the
 * shared secret in the `x-webhook-secret` header (WELCOME_WEBHOOK_SECRET
 * env var — set it in Vercel project settings).
 *
 * Also accepts a manual { "email": "..." } POST for testing.
 */

const DOCS = [
  {
    filename: "Disclosure-of-Representation.pdf",
    label: "Disclosure of Representation in Trading Services",
  },
  {
    filename: "Privacy-Document.pdf",
    label: "Privacy Notice and Consent",
  },
  {
    filename: "VOW-Terms-of-Use.pdf",
    label: "Terms of Use",
  },
];

export async function POST(req: Request) {
  try {
    // 1. Verify the shared secret (Supabase webhook or manual test call)
    const secret = req.headers.get("x-webhook-secret");
    const expected = process.env.WELCOME_WEBHOOK_SECRET;
    if (!expected) {
      console.error("WELCOME_WEBHOOK_SECRET is not configured in Vercel.");
      return NextResponse.json(
        { error: "Webhook secret not configured on server." },
        { status: 503 },
      );
    }
    if (secret !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract the new user's email
    //    Supabase webhook payload: { type, table, record, schema }
    const body = await req.json();
    const record = body?.record ?? {};
    const email: string | undefined =
      record.email ?? record.username ?? body?.email;
    const name: string = record.full_name ?? record.name ?? "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "No valid email in payload." },
        { status: 400 },
      );
    }

    // 3. Build attachment list from our own domain (permanent URLs)
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://squamish.realestate";
    const attachments = DOCS.map((d) => ({
      filename: d.filename,
      path: `${baseUrl}/docs/${d.filename}`,
    }));

    // 4. Send the welcome email
    const emailUser =
      process.env.NEXT_PUBLIC_EMAIL_USER || process.env.EMAIL_USER;
    const emailPass =
      process.env.NEXT_PUBLIC_EMAIL_PASS || process.env.EMAIL_PASS;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: { user: emailUser, pass: emailPass },
    });

    const html = masterDynamicTemplate(
      "Welcome to Squamish Real Estate",
      `Hi${name ? ` ${name}` : ""}, welcome aboard! Please review the attached documents — they are also available any time on our website.`,
      {
        Disclosure_of_Representation: `<a href="${baseUrl}/docs/Disclosure-of-Representation.pdf">View / Download</a>`,
        Privacy_Notice_and_Consent: `<a href="${baseUrl}/docs/Privacy-Document.pdf">View / Download</a>`,
        Terms_of_Use: `<a href="${baseUrl}/docs/VOW-Terms-of-Use.pdf">View / Download</a>`,
      },
    );

    await transporter.sendMail({
      from: `"Squamish Real Estate" <${emailUser}>`,
      to: email,
      subject: "Welcome to Squamish Real Estate — Your Documents",
      html,
      attachments,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Welcome email failed:", err?.message ?? err);
    return NextResponse.json(
      { error: "Failed to send welcome email." },
      { status: 500 },
    );
  }
}
