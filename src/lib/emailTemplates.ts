import { header, footer } from "./branding"; // Ensure this matches your file path

export const contactEmailTemplate = (
  name: string,
  email: string,
  message: string,
) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    ${header}
    <div style="padding: 32px; color: #334155;">
      <h2 style="color: #0f172a;">New Lead Received</h2>
      <p>You have a new inquiry from your website:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; font-weight: bold;">Name:</td><td>${name}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${email}</td></tr>
      </table>
      <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
        <p style="margin: 0; font-weight: bold;">Message:</p>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    </div>
    ${footer}
  </div>
`;

export const userThankYouTemplate = (name: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    ${header}
    <div style="padding: 32px; color: #334155; line-height: 1.6;">
      <h2 style="color: #0f172a;">Thanks for connecting, ${name}!</h2>
      <p>We have successfully received your inquiry regarding Squamish real estate.</p>
      <p>Sean Brawley will review your message and get back to you shortly. In the meantime, you can explore our latest listings on our website.</p>
      <p>Best regards,<br><strong>The Squamish Real Estate Team</strong></p>
    </div>
    ${footer}
  </div>
`;
