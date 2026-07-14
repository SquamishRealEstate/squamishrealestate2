const theme = {
  primary: "#1a2e25", // Deep Forest Green
  accent: "#8c5e46", // Warm Cedar accent
  textMain: "#0f172a", // Slate 900
  textMuted: "#64748b", // Slate 500
  border: "#e2e8f0", // Light slate
  bgMuted: "#f8fafc", // Off-white footer
};

export const header = `
  <div style="padding: 32px 24px; text-align: center; background-color: ${theme.primary}; border-bottom: 3px solid ${theme.accent};">
      <img src="https://drive.google.com/uc?export=view&id=1oPho0IRukaswWHHqZtPZr5-JtUOWtS6k" 
      alt="Squamish Real Estate" 
      style="width: 180px; height: auto; margin: 0 auto; display: block;"
      />
      <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 10px; font-family: 'Space Grotesk', sans-serif; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.8;">
        Find Your Mountain Home
      </p>
  </div>
`;

export const footer = `
  <div style="background-color: ${theme.bgMuted}; padding: 24px; text-align: center; border-top: 1px solid ${theme.border};">
      <p style="font-size: 11px; color: ${theme.textMuted}; margin: 0; font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.1em;">
          © ${new Date().getFullYear()} Sean Brawley PREC* • RE/MAX Masters Realty
      </p>
  </div>
`;

export const masterDynamicTemplate = (
  title: string,
  introText: string,
  details: Record<string, any>,
) => `
  <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 540px; margin: 20px auto; border: 1px solid ${theme.border}; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    ${header}
    
    <div style="padding: 32px; color: ${theme.textMain}; line-height: 1.6;">
      
      <h2 style="color: ${theme.primary}; margin: 0 0 6px 0; font-size: 22px; font-family: 'Outfit', sans-serif; font-weight: 700; letter-spacing: -0.02em;">
        ${title}
      </h2>
      
      <p style="color: ${theme.textMuted}; font-size: 14px; margin: 0 0 24px 0;">
        ${introText}
      </p>

      <div style="border: 1px solid ${theme.border}; border-radius: 8px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse;">
          ${Object.entries(details)
            .map(
              ([key, val], index, array) => `
            <tr style="${index % 2 === 0 ? "background-color: #ffffff;" : `background-color: ${theme.bgMuted};`}">
              <td style="padding: 14px 16px; font-weight: 700; color: ${theme.textMuted}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; width: 35%; vertical-align: top; font-family: 'Space Grotesk', sans-serif;">
                ${key.replace(/_/g, " ")}
              </td>
              <td style="padding: 14px 16px; color: ${theme.textMain}; font-weight: 500; font-size: 14px; vertical-align: top;">
                ${val}
              </td>
            </tr>
          `,
            )
            .join("")}
        </table>
      </div>
      
    </div>
    ${footer}
  </div>
`;
