import { google } from "googleapis";
import { NextResponse } from "next/server";
import { Readable } from "stream";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[]; // Use getAll for multiple
    const folderType = formData.get("folderType") as string;

    const folderId =
      folderType === "reviews"
        ? process.env.GOOGLE_DRIVE_REVIEWS_FOLDER_ID
        : process.env.GOOGLE_DRIVE_BLOG_FOLDER_ID;

    if (files.length === 0)
      return NextResponse.json({ error: "No files" }, { status: 400 });

    // 1. Setup the OAuth2 Client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const driveResponse = await drive.files.create({
        requestBody: {
          name: `${Date.now()}-${file.name}`, // Prevents name collisions
          parents: [folderId!],
        },
        media: { mimeType: file.type, body: stream },
        fields: "id, webViewLink",
      });

      const fileId = driveResponse.data.id;

      // Make public
      await drive.permissions.create({
        fileId: fileId!,
        requestBody: { role: "reader", type: "anyone" },
      });

      // Use the direct export link for images
      return `https://lh3.googleusercontent.com/u/0/d/${fileId}`;
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({ urls });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
