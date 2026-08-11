import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, CalendarClock, FileCheck2, HelpCircle, Info, Send, Sparkles, Trash2, Users, X } from "lucide-react";
import { askAssistant } from "@/lib/ai-services";
import { chatAssistant } from "@/lib/assistant.functions";
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
  text: "Namaste! I'm the **JGI-SIH AI Assistant**.\n\nI can help you pick a problem statement, strengthen your proposal, understand AI scores and similarity risk, and explain how Internal SIH selection works. Tap a quick action or ask me anything.",
};

const QUICK_ACTIONS = [
  { icon: CalendarClock, label: "Important Deadlines", prompt: "What are the important deadlines for Internal SIH 2026 and where can I see them?" },
  { icon: Users, label: "Mentors & Faculty", prompt: "How do mentors and faculty support teams in the Internal SIH process?" },
  { icon: Sparkles, label: "AI Features", prompt: "Explain the AI features available in the JGI-SIH portal." },
  { icon: Info, label: "SIH Information", prompt: "Give me an overview of the Smart India Hackathon and this internal round." },
  { icon: HelpCircle, label: "Portal Help", prompt: "How do I navigate the portal and complete each stage?" },
  { icon: FileCheck2, label: "Submission Guidelines", prompt: "What are the proposal submission guidelines and what should each section contain?" },
];

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
  const chat = useServerFn(chatAssistant);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || typing) return;
    setInput("");
    const history = messages
      .filter((m) => m.id !== "greet")
      .slice(-8)
      .map((m) => ({ role: m.role === "user" ? ("user" as const) : ("assistant" as const), content: m.text }));
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", text: q }]);
    setTyping(true);

    let answer: string | null = null;
    try {
      const res = await chat({ data: { question: q, history } });
      answer = res.answer;
    } catch {
      answer = null;
    }
    if (!answer) answer = await askAssistant(q);

    setTyping(false);
    setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "ai", text: answer }]);
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close JGI-SIH AI Assistant" : "Open JGI-SIH AI Assistant"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[60] flex size-13 items-center justify-center rounded-full brand-gradient text-primary-foreground shadow-pop transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
      </button>

      {open && (
        <div className="fixed inset-x-3 bottom-22 z-[60] flex h-[min(600px,72vh)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-pop sm:inset-x-auto sm:right-5 sm:w-[400px]">
          <header className="flex items-center gap-3 brand-gradient px-4 py-3 text-primary-foreground">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white/15">
              <Bot className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold">JGI-SIH AI Assistant</p>
              <p className="text-[11px] opacity-80">Always available · portal-aware</p>
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

            {messages.length === 1 && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => void send(a.prompt)}
                    className="surface-card flex items-center gap-2 p-2.5 text-left text-[11px] font-medium transition-colors hover:border-primary/40"
                  >
                    <a.icon className="size-3.5 shrink-0 text-primary" />
                    <span className="truncate">{a.label}</span>
                  </button>
                ))}
              </div>
            )}

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
                aria-label="Message the AI assistant"
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
