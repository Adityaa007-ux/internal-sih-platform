import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, Trash2, X } from "lucide-react";
import { ASSISTANT_SUGGESTIONS, askAssistant } from "@/lib/ai-services";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Msg {
  id: string;
  role: "user" | "ai";
  text: string;
}

const GREETING: Msg = {
  id: "greet",
  role: "ai",
  text: "Namaste! I'm the **JGI-SIH AI Assistant**.\n\nI can help you choose a problem statement, strengthen your proposal, understand your AI scores and similarity risk, and explain how the Internal SIH selection works. Pick a suggested prompt or ask me anything.",
};

function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-[13px] leading-relaxed">
        {parts.map((p, j) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={j} className="font-semibold">
              {p.slice(2, -2)}
            </strong>
          ) : (
            <span key={j}>{p}</span>
          ),
        )}
      </p>
    );
  });
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || typing) return;
    setInput("");
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", text: q }]);
    setTyping(true);
    const answer = await askAssistant(q);
    setTyping(false);
    setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "ai", text: answer }]);
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open JGI-SIH AI Assistant"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full brand-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-pop transition-transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="size-4" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex h-[min(620px,85vh)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-pop sm:inset-x-auto sm:right-5 sm:w-[420px]">
          <header className="flex items-center gap-3 brand-gradient px-4 py-3 text-primary-foreground">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white/15">
              <Bot className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold">JGI-SIH AI Assistant</p>
              <p className="text-[11px] opacity-80">Demo engine · always available</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setMessages([GREETING])}
                aria-label="Clear chat"
                className="rounded-md p-1.5 transition-colors hover:bg-white/15"
              >
                <Trash2 className="size-4" />
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-md p-1.5 transition-colors hover:bg-white/15">
                <X className="size-4" />
              </button>
            </div>
          </header>

          <div className="scrollbar-slim flex-1 space-y-3 overflow-y-auto bg-background px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[86%] rounded-2xl px-3.5 py-2.5",
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border border-border bg-card",
                  )}
                >
                  {renderText(m.text)}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border bg-card px-3 pb-3 pt-2">
            <div className="scrollbar-slim mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {ASSISTANT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="shrink-0 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium text-secondary-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about proposals, scores, deadlines…"
                className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || typing} aria-label="Send message">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
