import { google } from "googleapis";
import { NextResponse } from "next/server";
import { Readable } from "stream";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // 1. Setup the OAuth2 Client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // 2. Prepare the file stream
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // 3. Upload to Google Drive
    const driveResponse = await drive.files.create({
      requestBody: {
        name: `${file.name}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: "id",
    });

    const fileId = driveResponse.data.id;

    // 4. Make the specific file public so it displays on your blog
    await drive.permissions.create({
      fileId: fileId!,
      requestBody: { role: "reader", type: "anyone" },
    });

    return NextResponse.json({
      url: `https://lh3.googleusercontent.com/d/${fileId}`,
    });
  } catch (error: any) {
    console.error("DRIVE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
