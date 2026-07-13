import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { masterDynamicTemplate } from "@/lib/emailTemplates";

export async function POST(req: Request) {
  try {
    // 1. Parse the body exactly ONCE here
    const body = await req.json();

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
    } = body;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.NEXT_PUBLIC_EMAIL_USER,
        pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
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
          Message: "User is interested in the $1,000 Buy or Sell Credit offer.",
        };

        const sharedHtml = masterDynamicTemplate(
          "Referral Credit Inquiry",
          "A user has clicked to learn more about the $1,000 Buy or Sell Credit.",
          details,
        );

        adminHtml = sharedHtml;
        userHtml = sharedHtml;
        break;
      }

      default: {
        adminSubject = `New Inquiry: ${name}`;
        userSubject = "We've received your message - Squamish Real Estate";

        const details = {
          Name: name,
          Email: email,
          Message: message,
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
