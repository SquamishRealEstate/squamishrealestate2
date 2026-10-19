import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Server-side proxy for the Dify "Squamish AI Property Search" app.
//
// Why a proxy instead of Dify's browser embed:
// 1. The Dify secret key (DIFY_API_KEY) never reaches the browser.
// 2. Only logged-in users can talk to the chatbot — unauthenticated
//    requests are rejected here, before Dify is ever called.
// 3. The Supabase user id is passed to Dify as the end-user identity so
//    each member keeps their own conversation history.

const DIFY_API_BASE =
  process.env.DIFY_API_BASE || "https://api-dify.squamish.realestate/v1";

export async function POST(req: Request) {
  // 1. Verify the caller has a live Supabase session
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Login required to use AI search." },
      { status: 401 },
    );
  }

  // 2. Parse and validate the client payload
  let body: {
    query?: string;
    conversation_id?: string;
    inputs?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const query = body.query?.trim();
  if (!query) {
    return NextResponse.json({ message: "query is required" }, { status: 400 });
  }

  const apiKey = process.env.DIFY_API_KEY;
  if (!apiKey) {
    console.error("DIFY_API_KEY is not configured");
    return NextResponse.json(
      { message: "AI search is not configured" },
      { status: 500 },
    );
  }

  // 3. Forward to Dify (streaming) as the server-side identity
  const upstream = await fetch(`${DIFY_API_BASE}/chat-messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: body.inputs ?? {},
      query,
      response_mode: "streaming",
      conversation_id: body.conversation_id ?? "",
      user: session.user.id, // per-member conversation continuity in Dify
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error("Dify upstream error:", upstream.status, detail);
    return NextResponse.json(
      { message: "AI search request failed" },
      { status: 502 },
    );
  }

  // 4. Pass the SSE stream straight through to the browser
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
