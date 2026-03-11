"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TailoredContent } from "@/types/resumes";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface ResumeChatProps {
  resumeId: string;
  onUpdate: (content: TailoredContent) => void;
}

export function ResumeChat({ resumeId, onUpdate }: ResumeChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "What would you like to change about your resume? For example: \"Make the summary more concise\", \"Add more emphasis on leadership in my internship bullets\", or \"Remove the volunteering section\"." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch(`/api/resumes/${resumeId}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to update resume");
      }

      const updated: TailoredContent = await res.json();
      onUpdate(updated);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Done! The resume has been updated. You can see the changes in the preview." },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: e instanceof Error ? e.message : "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="size-4" />
          Edit Resume with AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2 text-sm",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <Bot className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
              )}
              <p
                className={cn(
                  "rounded-lg px-3 py-2 max-w-[85%]",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {msg.text}
              </p>
              {msg.role === "user" && (
                <User className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 text-sm">
              <Bot className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
              <p className="rounded-lg px-3 py-2 bg-muted text-muted-foreground flex items-center gap-2">
                <Loader2 className="size-3 animate-spin" />
                Updating resume…
              </p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask to change anything… (Enter to send)"
            className="min-h-[40px] max-h-32 resize-none"
            rows={1}
            disabled={loading}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
