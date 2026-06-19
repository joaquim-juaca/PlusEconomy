import React, { useEffect, useState } from "react";
import { Plus, Trash2, AlertTriangle, Gauge, X } from "lucide-react";
import { api } from "../lib/api";
import { useI18n, CATEGORIES_EXPENSE } from "../contexts/I18nContext";
import { toast } from "sonner";

function fmt(v, lang) {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", { style: "currency", currency: lang === "pt" ? "BRL" : "USD" }).format(v || 0);
}

export default function Limits() {
  const { t, tCat, lang } = useI18n();
  const [list, setList] = useState([]);
  const [cards, setCards] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ label: "", category: "Alimentação", card_id: "", monthly_amount: "" });

  const load = async () => {
    const [l, c] = await Promise.all([api.get("/limits"), api.get("/cards")]);
    setList(l.data);
    setCards(c.data);
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/limits", {
        label: form.label,
        category: form.category || null,
        card_id: form.card_id || null,
        monthly_amount: parseFloat(form.monthly_amount),
      });
      setOpen(false);
      setForm({ label: "", category: "Alimentação", card_id: "", monthly_amount: "" });
      toast.success(t("save"));
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || t("error_generic"));
    }
  };

  const del = async (id) => {
    await api.delete(`/limits/${id}`);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto pb-20" data-testid="limits-page">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight">{t("limits_title")}</h1>
          <p className="text-sm text-[var(--pe-muted)] mt-2">{t("limits_desc")}</p>
        </div>
        <button onClick={() => setOpen(true)} data-testid="limits-new-btn" className="pe-btn-accent px-5 py-2.5 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t("new_limit")}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="pe-card p-10 text-center">
          <Gauge className="h-10 w-10 mx-auto mb-3 text-[var(--pe-muted)]" />
          <div className="text-sm text-[var(--pe-muted)]">{t("limits_desc")}</div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {list.map((L) => {
            const over = L.percent >= 100;
            const bar = Math.min(L.percent, 100);
            const color = over ? "var(--pe-danger)" : L.alert ? "var(--pe-warning)" : "var(--pe-success)";
            return (
              <div key={L.id} className="pe-card p-6" data-testid={`limit-${L.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-display text-lg font-bold">{L.label}</div>
                    <div className="text-xs text-[var(--pe-muted)]">
                      {L.category ? tCat(L.category) : ""}{L.card_id ? (L.category ? " · " : "") + (cards.find((c) => c.id === L.card_id)?.name || "card") : ""}
                    </div>
                  </div>
                  <button onClick={() => del(L.id)} data-testid={`limit-del-${L.id}`} className="p-2 rounded-full hover:bg-[var(--pe-danger)]/10 text-[var(--pe-muted)] hover:text-[var(--pe-danger)]"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)]">
                    {t("spent")} <span className="text-[var(--pe-text)]">{fmt(L.spent, lang)}</span> {t("of")} <span className="text-[var(--pe-text)]">{fmt(L.monthly_amount, lang)}</span>
                  </span>
                  <span className="font-display font-bold text-lg tabular-nums" style={{ color }}>{L.percent.toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--pe-border)] overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${bar}%`, background: color }} />
                </div>
                {L.alert && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold" style={{ color }}>
                    <AlertTriangle className="h-3.5 w-3.5" /> {t("limit_alert")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md pe-card p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--pe-border)]/50"><X className="h-4 w-4" /></button>
            <h3 className="font-display text-xl font-black mb-5">{t("new_limit")}</h3>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("limit_label")}</label>
                <input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="pe-input" data-testid="limit-label" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("category")}</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="pe-input" data-testid="limit-category">
                  <option value="">—</option>
                  {CATEGORIES_EXPENSE.map((c) => <option key={c} value={c}>{tCat(c)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("card")}</label>
                <select value={form.card_id} onChange={(e) => setForm({ ...form, card_id: e.target.value })} className="pe-input" data-testid="limit-card">
                  <option value="">{t("no_card")}</option>
                  {cards.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.last4}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("limit_amount")}</label>
                <input type="number" step="0.01" min="0.01" required value={form.monthly_amount} onChange={(e) => setForm({ ...form, monthly_amount: e.target.value })} className="pe-input" data-testid="limit-amount" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="pe-btn-outline flex-1 py-2.5">{t("cancel")}</button>
                <button type="submit" data-testid="limit-form-submit" className="pe-btn-primary flex-1 py-2.5">{t("save")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
