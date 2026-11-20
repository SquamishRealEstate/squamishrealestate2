// One-time helper: mint a fresh Google OAuth refresh token for images.js.
// Needed if the existing GOOGLE_REFRESH_TOKEN belongs to an old/migrated
// Google identity (symptom: the script cannot see folders your browser owns).
//
// Usage (Git Bash):
//   GOOGLE_CLIENT_ID=<id> GOOGLE_CLIENT_SECRET=<secret> node google-auth.js
//
// Then open the printed URL, sign in as the account that OWNS the Drive
// folders, and click Allow. This script captures the redirect automatically
// and prints the refresh token to store in GitHub secrets.

const { google } = require("googleapis");
const http = require("http");

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const PORT = 3000;

if (!clientId || !clientSecret) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  `http://localhost:${PORT}/callback`,
);

const url = oauth2Client.generateAuthUrl({
  access_type: "offline", // required to receive a refresh token
  prompt: "consent", // force the consent screen so a refresh token is issued
  scope: ["https://www.googleapis.com/auth/drive"],
});

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, `http://localhost:${PORT}`);
    if (u.pathname !== "/callback") {
      res.end();
      return;
    }
    const code = u.searchParams.get("code");
    if (!code) {
      res.end("No authorization code received.");
      return;
    }
    const { tokens } = await oauth2Client.getToken(code);
    res.end("Authorization complete. You can close this tab.");
    server.close();
    console.log("\nRefresh token (set as the GOOGLE_REFRESH_TOKEN secret):\n");
    console.log(tokens.refresh_token);
    console.log(
      "\nReminder: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET secrets must match the OAuth client used above.",
    );
    process.exit(0);
  } catch (err) {
    res.end("Error: " + err.message);
  }
});

server.listen(PORT, () => {
  console.log(
    "Open this URL in your browser and sign in as the account that OWNS the Drive folders:\n",
  );
  console.log(url);
  console.log("\nWaiting for authorization...");
});
