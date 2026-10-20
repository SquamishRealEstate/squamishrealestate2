"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter, usePathname } from "next/navigation";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Send,
  RotateCcw,
  Bot,
  Lock,
} from "lucide-react";
import { supabase } from "@/config/supabaseClient";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  error?: boolean;
}

const SUGGESTED_TOPICS = [
  "Homes for sale under $1.5 million",
  "Townhouses for sale in Brackendale",
  "2-bedroom condos in Downtown Squamish",
];

export default function AiPropertyChat({ user }: { user: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const conversationIdRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the thread pinned to the latest message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, expanded]);

  // Logged-out visitors see a Login / Create Account prompt that routes to
  // the login page and returns them here afterwards; only authenticated
  // users get the expand/collapse arrow.
  const handleHeaderClick = () => {
    if (!user) {
      router.push(`/login?callback=${encodeURIComponent(pathname)}`);
      return;
    }
    setExpanded((e) => !e);
  };

  const sendMessage = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || sending || !user) return;

    setExpanded(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "", pending: true },
    ]);
    setInput("");
    setSending(true);

    try {
      // This site keeps the Supabase session in the browser (localStorage),
      // so we pass the access token explicitly and the API route verifies it.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
          query: text,
          conversation_id: conversationIdRef.current,
        }),
      });

      if (!res.ok || !res.body) {
        const detail =
          res.status === 401 ? "Please log in to use AI search." : "";
        throw new Error(detail || `Request failed (${res.status})`);
      }

      // Read Dify's SSE stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Patch the pending assistant bubble (last message in the thread)
      const patch = (fn: (m: ChatMessage) => ChatMessage) => {
        setMessages((prev) => {
          const i = prev.length - 1;
          if (i < 0 || prev[i].role !== "assistant") return prev;
          return prev.map((m, idx) => (idx === i ? fn(m) : m));
        });
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by a blank line
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const evt of events) {
          const dataLine = evt
            .split("\n")
            .find((l) => l.startsWith("data:"));
          if (!dataLine) continue;

          let payload: any;
          try {
            payload = JSON.parse(dataLine.slice(5).trim());
          } catch {
            continue;
          }

          if (payload.event === "message" && typeof payload.answer === "string") {
            if (payload.conversation_id)
              conversationIdRef.current = payload.conversation_id;
            patch((m) => ({
              ...m,
              content: m.content + payload.answer,
              pending: false,
            }));
          } else if (payload.event === "message_replace") {
            patch((m) => ({ ...m, content: payload.answer ?? m.content }));
          } else if (payload.event === "error") {
            throw new Error(payload.message || "AI search error");
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant") {
          next[next.length - 1] = {
            ...last,
            pending: false,
            error: true,
            content:
              last.content ||
              err.message ||
              "Something went wrong. Please try again.",
          };
        }
        return next;
      });
    } finally {
      setSending(false);
    }
  };

  const resetConversation = () => {
    conversationIdRef.current = "";
    setMessages([]);
  };

  return (
    <div className="mt-8 mb-10 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white overflow-hidden shadow-sm">
      {/* Header / collapse toggle */}
      <button
        type="button"
        onClick={handleHeaderClick}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-blue-50/60 transition-colors"
      >
        <span className="bg-blue-600 text-white p-2 rounded-xl shrink-0">
          <Sparkles size={18} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-bold text-gray-900">
            AI Search Assistant
          </span>
          <span className="block text-xs text-gray-500 truncate">
            Ask anything — Active listings, off-market data, local dining &amp;
            business guide.
          </span>
        </span>
        {user ? (
          expanded ? (
            <ChevronUp size={18} className="text-gray-400 shrink-0" />
          ) : (
            <ChevronDown size={18} className="text-gray-400 shrink-0" />
          )
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
            <Lock size={12} />
            Login / Create Account
          </span>
        )}
      </button>

      {expanded && (
        <div className="border-t border-blue-100">
          {/* Suggested topics — hidden once the conversation starts */}
          {messages.length === 0 && (
            <div className="px-5 pt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Popular searches
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    disabled={sending}
                    onClick={() => sendMessage(topic)}
                    className="text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all disabled:opacity-40"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message thread */}
          <div
            ref={scrollRef}
            className="px-5 py-4 space-y-3 max-h-[26rem] overflow-y-auto"
          >
            {messages.length === 0 && (
              <div className="flex items-start gap-2 text-sm text-gray-500 py-2">
                <Bot size={16} className="mt-0.5 shrink-0 text-blue-500" />
                <span>
                  Try a suggested search above, or ask your own question — for
                  example &quot;What&apos;s available near Quest University
                  under $900k?&quot;
                </span>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user" || msg.error
                      ? "whitespace-pre-wrap"
                      : ""
                  } ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : msg.error
                        ? "bg-red-50 text-red-600 border border-red-100 rounded-bl-sm"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" && !msg.error ? (
                    <ReactMarkdown
                      components={{
                        a: (props) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 font-semibold hover:underline"
                          />
                        ),
                        strong: (props) => (
                          <strong {...props} className="font-bold text-gray-900" />
                        ),
                        ul: (props) => (
                          <ul {...props} className="list-disc pl-5 my-1.5 space-y-1" />
                        ),
                        ol: (props) => (
                          <ol {...props} className="list-decimal pl-5 my-1.5 space-y-1" />
                        ),
                        p: (props) => <p {...props} className="my-1" />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                  {msg.pending && (
                    <span className="inline-flex gap-1 ml-1 align-middle">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="px-5 pb-5 pt-1 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Squamish real estate…"
              disabled={sending}
              className="flex-1 text-sm rounded-xl border border-gray-200 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 disabled:opacity-50"
            />
            {messages.length > 0 && (
              <button
                type="button"
                onClick={resetConversation}
                title="Start a new conversation"
                className="p-2.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            )}
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
