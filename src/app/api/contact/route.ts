import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { masterDynamicTemplate } from "@/lib/emailTemplates";

// ---- Anti-spam: best-effort in-memory IP rate limit ----
// Note: on serverless platforms (e.g. Vercel) each instance has its own map,
// so this is a speed bump, not a hard guarantee. Turnstile is the hard gate.
const submissionLog = new Map<string, number[]>();
const RATE_LIMIT_MAX = 5; // submissions per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (submissionLog.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  if (recent.length >= RATE_LIMIT_MAX) {
    submissionLog.set(ip, recent);
    return true;
  }
  recent.push(now);
  submissionLog.set(ip, recent);
  return false;
}

export async function POST(req: Request) {
  try {
    // 1. Parse the body exactly ONCE here
    const body = await req.json();

    // ---- Anti-spam checks (run before ANY email is sent) ----
    // Blocked submissions get a fake { success: true } so bots receive no
    // signal that they were rejected and don't adapt their behaviour.
    const fakeSuccess = () => NextResponse.json({ success: true });

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

    // a) Honeypot: a hidden field humans never fill. If it has any value,
    //    the submission came from a bot.
    if (
      typeof body.company_website === "string" &&
      body.company_website.trim() !== ""
    ) {
      console.warn("Spam blocked (honeypot):", ip);
      return fakeSuccess();
    }

    // b) Time-trap: real humans need a few seconds to fill the form.
    //    Reject submissions faster than 3s or older than 2h (replayed forms).
    if (typeof body.formLoadedAt === "number") {
      const elapsed = Date.now() - body.formLoadedAt;
      if (elapsed < 3000 || elapsed > 2 * 60 * 60 * 1000) {
        console.warn("Spam blocked (time-trap):", ip);
        return fakeSuccess();
      }
    }

    // c) Rate limit per IP
    if (isRateLimited(ip)) {
      console.warn("Spam blocked (rate limit):", ip);
      return fakeSuccess();
    }

    // d) Contact-form-specific checks (don't break the other template types)
    const isContactForm =
      !body.templateType || body.templateType === "CONTACT_FORM";
    if (isContactForm) {
      // Digits-only messages are never real inquiries (bot pattern)
      if (
        typeof body.message === "string" &&
        /^\d+$/.test(body.message.trim())
      ) {
        console.warn("Spam blocked (digits-only message):", ip);
        return fakeSuccess();
      }

      // Cloudflare Turnstile: enforced when TURNSTILE_SECRET_KEY is set.
      // Without the secret configured this step is skipped (honeypot +
      // time-trap still apply).
      if (process.env.TURNSTILE_SECRET_KEY) {
        const token = body.turnstileToken;
        if (!token) {
          return NextResponse.json(
            { message: "Verification required" },
            { status: 400 },
          );
        }
        const verifyRes = await fetch(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              secret: process.env.TURNSTILE_SECRET_KEY,
              response: token,
              remoteip: ip,
            }),
          },
        );
        const verifyJson = await verifyRes.json();
        if (!verifyJson.success) {
          console.warn("Spam blocked (turnstile):", ip);
          return NextResponse.json(
            { message: "Verification failed" },
            { status: 400 },
          );
        }
      }
    }

    // 2. Destructure everything you might need from the body
    const {
      name,
      email,
      message,
      templateType,
      propertyAddress,
      scores,
      estimateValue,
      reviewText,
      photo_urls,
      issueDetails,
      propertyOwner,
      date,
      time,
      phone,
      query,
      purchasePrice,
      deposit,
      reason,
    } = body;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        // Plain names are server-only (not exposed to the browser bundle).
        // NEXT_PUBLIC_* fallbacks keep old Vercel env var configs working
        // until they are migrated; remove the fallbacks once Vercel uses
        // EMAIL_USER / EMAIL_PASS only.
        user: process.env.EMAIL_USER || process.env.NEXT_PUBLIC_EMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.NEXT_PUBLIC_EMAIL_PASS,
      },
    });

    let adminHtml = "";
    let userHtml = "";
    let adminSubject = "";
    let userSubject = "";

    // Template Switching Logic
    switch (templateType) {
      case "PROPERTY_REPORT": {
        adminSubject = `Report Request: ${propertyAddress}`;
        userSubject = "Your Property Report Request";

        const sharedHtml = masterDynamicTemplate(
          "Property Report Request",
          "We have received your request for a detailed market report and are currently preparing the data.",
          {
            Property_Address: propertyAddress, // Address moved here
            Contact_Email: email,
            Name: name || "Valued Client",
          },
        );

        adminHtml = sharedHtml;
        userHtml = sharedHtml;
        break;
      }

      case "REVIEW_FORM": {
        adminSubject = `Property Review: ${propertyAddress}`;
        userSubject = "Copy of your Property Review";

        // Build details with Address at the top
        const details: Record<string, any> = {
          Property_Address: propertyAddress, // Address moved here
          Submitted_By: name || "Valued Client",
          Contact_Email: email,
          Estimated_Value: estimateValue,
          ...scores,
          Comments: reviewText || "No comments provided.",
        };

        if (photo_urls && photo_urls.length > 0) {
          details["Attached_Photos"] = photo_urls
            .map(
              (url: string, i: number) =>
                `<a href="${url}" style="color: #8c5e46; text-decoration: none; font-weight: 600;">View Photo ${i + 1}</a>`,
            )
            .join(", ");
        }

        const sharedHtml = masterDynamicTemplate(
          "Property Review Details",
          "A property review has been submitted with the following details.",
          details,
        );

        adminHtml = sharedHtml;
        userHtml = sharedHtml;
        break;
      }

      case "REPORT_ISSUE": {
        adminSubject = `🚨 Issue Reported: ${propertyAddress}`;
        userSubject = "We've received your report - Squamish Real Estate";

        const details = {
          Reported_By: name || "User",
          User_Email: email,
          Property: propertyAddress,
          Issue_Description: issueDetails,
        };

        const sharedHtml = masterDynamicTemplate(
          "Issue Report Received",
          "Thank you for helping us improve. We have received your report and our team will look into it shortly.",
          details,
        );

        adminHtml = sharedHtml;
        userHtml = sharedHtml;
        break;
      }

      case "THINKING_OF_SELLING": {
        adminSubject = `Thinking of Selling: ${name}`;
        userSubject = "Thanks for reaching out - Squamish Real Estate";

        const details = {
          Email: email,
          Property: propertyAddress,
          Owner: propertyOwner || "N/A",
        };

        const sharedHtml = masterDynamicTemplate(
          "Thinking of Selling Inquiry",
          "We have received your inquiry about selling your property. Our team will review your message and get back to you shortly.",
          details,
        );

        adminHtml = sharedHtml;
        userHtml = sharedHtml;
        break;
      }

      case "SCHEDULE_TOUR": {
        adminSubject = `Tour Request: ${name}`;
        userSubject = "We've received your tour request - Squamish Real Estate";

        const details = {
          Name: name,
          Email: email,
          Property: propertyAddress,
          Date: date,
          Time: time,
          Phone: phone || "N/A",
        };

        const sharedHtml = masterDynamicTemplate(
          "Tour Request Received",
          "Thank you for your interest! We have received your tour request and will confirm the details with you shortly.",
          details,
        );

        adminHtml = sharedHtml;
        userHtml = sharedHtml;
        break;
      }

      case "REQUEST_INFO": {
        adminSubject = `Info Request: ${name}`;
        userSubject =
          "We've received your information request - Squamish Real Estate";

        const details = {
          Name: name,
          Email: email,
          Property: propertyAddress,
          Query: query || "N/A",
        };

        const sharedHtml = masterDynamicTemplate(
          "Information Request Received",
          "We have received your request for more information. Our team will review your query and get back to you shortly.",
          details,
        );

        adminHtml = sharedHtml;
        userHtml = sharedHtml;
        break;
      }

      case "START_OFFER": {
        adminSubject = `Offer Submission: ${name}`;
        userSubject = "We've received your offer - Squamish Real Estate";

        const details = {
          Name: name,
          Email: email,
          Property: propertyAddress,
          Purchase_Price: purchasePrice,
          Deposit: deposit,
          Message: message || "N/A",
        };

        const sharedHtml = masterDynamicTemplate(
          "Offer Submission Received",
          "Thank you for submitting your offer. We have received the details and will review them shortly.",
          details,
        );

        adminHtml = sharedHtml;
        userHtml = sharedHtml;
        break;
      }

      // Inside your switch (templateType) block:
      case "REFERRAL_CREDIT": {
        adminSubject = `$1,000 Buy or Sell Credit Inquiry`;
        userSubject = "We've received your inquiry - Squamish Real Estate";

        const details = {
          Message: `${name} would like more information on the Cashback credit of $1,000 or 10% of commission earned on your next transaction.`,
        };

        const user = masterDynamicTemplate(
          "Membership Rewards",
          "Thank you for your interest! We have received your inquiry and will review it shortly.",
          details,
        );

        const admin = masterDynamicTemplate(
          "Membership Rewards",
          `Please reply to ${name} | ${email}`,
          details,
        );

        adminHtml = admin;
        userHtml = user;
        break;
      }

      default: {
        adminSubject = `New Inquiry: ${name}`;
        userSubject = "We've received your message - Squamish Real Estate";

        // If no tour/meeting date was picked, show when the inquiry was
        // submitted instead of leaving the row blank.
        // B.C. adopted permanent Pacific time (PCT, UTC-7) in 2026 — no more
        // seasonal clock changes — so we use a fixed UTC-7 offset rather than
        // relying on the server's timezone database being up to date.
        const pctNow = new Date(Date.now() - 7 * 60 * 60 * 1000);
        const submittedAt =
          new Intl.DateTimeFormat("en-US", {
            timeZone: "UTC",
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }).format(pctNow) + " PCT";

        const details = {
          Name: name,
          Email: email,
          Reason: reason,
          Message: message,
          ...(date ? { Date: date } : { Submitted: submittedAt }),
        };

        adminHtml = masterDynamicTemplate(
          "New Contact Inquiry",
          "A new contact form submission has been received from the website.",
          details,
        );

        userHtml = masterDynamicTemplate(
          "Thanks for reaching out",
          "We have successfully received your inquiry and will get back to you shortly.",
          details,
        );
        break;
      }
    }

    await Promise.all([
      // 1. Sent to Sean (Admin)
      transporter.sendMail({
        from: `"Squamish Real Estate" <${process.env.EMAIL_USER}>`,
        to: "sean@squamish.realestate",
        subject: adminSubject,
        html: adminHtml,
      }),

      // 2. Sent to User (Confirmation)
      transporter.sendMail({
        from: `"Squamish Real Estate" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: userSubject,
        html: userHtml,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ message: "Failed to send" }, { status: 500 });
  }
}
