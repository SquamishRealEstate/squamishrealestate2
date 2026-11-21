// One-time helper: generates a GOOGLE_REFRESH_TOKEN for images.js.
// Run with: npm run auth:google
const http = require("http");
const { google } = require("googleapis");
require("dotenv").config({ path: [".env.local", ".env"] });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PORT = 3001; // avoids clashing with `next dev` on 3000
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env.local",
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline", // required to get a refresh token
  prompt: "consent", // forces re-consent so a refresh token is always returned
  scope: ["https://www.googleapis.com/auth/drive"],
});

console.log("\n1) In Google Cloud Console, add this Authorized redirect URI");
console.log("   to your OAuth client (APIs & Services > Credentials):");
console.log(`   ${REDIRECT_URI}\n`);
console.log("2) Open this URL in your browser and sign in with the Google");
console.log("   account that owns the Drive:\n");
console.log(authUrl + "\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== "/oauth2callback") return;

  const code = url.searchParams.get("code");
  if (!code) {
    res.end("No authorization code received.");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.end("Success! You can close this tab and return to the terminal.");
    console.log("\nAdd this line to your .env.local:\n");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    server.close();
    process.exit(0);
  } catch (err) {
    console.error("Token exchange failed:", err.message);
    res.end("Token exchange failed — see terminal.");
  }
});

server.listen(PORT, () => console.log(`Waiting for callback on port ${PORT}...`));
