import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { api } from "../lib/api";
import { useI18n } from "../contexts/I18nContext";
import { useAuth } from "../contexts/AuthContext";
import PremiumGate from "../components/PremiumGate";
import { toast } from "sonner";

export default function AiAssistant() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);

  const suggestions = lang === "pt"
    ? ["Onde posso economizar neste mês?", "Qual minha maior categoria de gasto?", "Dicas para alcançar minhas metas"]
    : ["Where can I save this month?", "What's my biggest spending category?", "Tips to reach my goals"];

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const r = await api.post("/ai/chat", { message: msg, session_id: sessionId });
      setSessionId(r.data.session_id);
      setMessages((m) => [...m, { role: "assistant", content: r.data.reply }]);
    } catch (err) {
      toast.error(err?.response?.data?.detail || t("error_generic"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const inner = (
    <div className="max-w-4xl mx-auto pb-20 flex flex-col min-h-[calc(100vh-120px)]" data-testid="ai-page">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-[var(--pe-accent)] text-[#FDFCF8] grid place-items-center"><Sparkles className="h-5 w-5" /></div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight">{t("ai_title")}</h1>
        </div>
        <p className="text-sm text-[var(--pe-muted)] ml-[52px]">{t("ai_sub")}</p>
      </div>

      <div ref={scrollRef} className="flex-1 pe-card p-5 overflow-y-auto space-y-4 mb-4 min-h-[400px]" data-testid="ai-chat-scroll">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Sparkles className="h-8 w-8 text-[var(--pe-accent)] mb-3" />
            <p className="text-sm text-[var(--pe-muted)] mb-6 max-w-sm">{lang === "pt" ? "Pergunte sobre seus gastos, metas ou peça recomendações personalizadas." : "Ask about your spending, goals or request personalized recommendations."}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} data-testid={`ai-suggest-${s.slice(0,10)}`} className="pe-btn-outline px-4 py-2 text-xs">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[var(--pe-primary)] text-[#FDFCF8] rounded-br-sm"
                  : "bg-[var(--pe-border)]/40 rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--pe-border)]/40 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--pe-muted)] animate-pulse" />
              <span className="h-2 w-2 rounded-full bg-[var(--pe-muted)] animate-pulse [animation-delay:0.15s]" />
              <span className="h-2 w-2 rounded-full bg-[var(--pe-muted)] animate-pulse [animation-delay:0.3s]" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("ai_placeholder")}
          className="pe-input"
          data-testid="ai-input"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} data-testid="ai-send-btn" className="pe-btn-accent px-5 disabled:opacity-50 flex items-center gap-2">
          <Send className="h-4 w-4" /> <span className="hidden sm:inline">{t("ai_send")}</span>
        </button>
      </form>
    </div>
  );

  if (!user?.is_premium) return <PremiumGate>{inner}</PremiumGate>;
  return inner;
}
