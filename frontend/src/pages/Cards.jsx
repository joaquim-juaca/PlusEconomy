import React, { useEffect, useState } from "react";
import { Plus, Trash2, CreditCard as CardIcon, X } from "lucide-react";
import { api } from "../lib/api";
import { useI18n } from "../contexts/I18nContext";
import { toast } from "sonner";

const PRESET_COLORS = ["#285943", "#E06D4F", "#3A7D5C", "#E0A94F", "#1A1D1A", "#6E7370"];

export default function Cards() {
  const { t } = useI18n();
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", last4: "", color: "#285943", limit: "" });

  const load = async () => {
    const r = await api.get("/cards");
    setList(r.data);
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/cards", {
        name: form.name,
        last4: form.last4,
        color: form.color,
        limit: form.limit ? parseFloat(form.limit) : null,
      });
      setOpen(false);
      setForm({ name: "", last4: "", color: "#285943", limit: "" });
      toast.success(t("save"));
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || t("error_generic"));
    }
  };

  const del = async (id) => {
    await api.delete(`/cards/${id}`);
    toast.success(t("delete"));
    load();
  };

  return (
    <div className="max-w-5xl mx-auto pb-20" data-testid="cards-page">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight">{t("cards_title")}</h1>
          <p className="text-sm text-[var(--pe-muted)] mt-2">{t("cards_desc")}</p>
        </div>
        <button onClick={() => setOpen(true)} data-testid="cards-new-btn" className="pe-btn-accent px-5 py-2.5 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t("new_card")}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="pe-card p-10 text-center">
          <CardIcon className="h-10 w-10 mx-auto mb-3 text-[var(--pe-muted)]" />
          <div className="text-sm text-[var(--pe-muted)]">{t("cards_desc")}</div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl p-6 text-[#FDFCF8] relative overflow-hidden aspect-[1.6/1] flex flex-col justify-between shadow-lg"
              style={{ background: c.color }}
              data-testid={`card-item-${c.id}`}
            >
              <div className="flex items-start justify-between">
                <CardIcon className="h-7 w-7 opacity-80" />
                <button onClick={() => del(c.id)} data-testid={`card-del-${c.id}`} className="p-1.5 rounded-full bg-white/10 hover:bg-white/25">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <div className="font-display text-xl font-black mb-3 tracking-wider">•••• {c.last4}</div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">{t("card_name")}</div>
                    <div className="font-bold">{c.name}</div>
                  </div>
                  {c.limit && (
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">{t("card_limit")}</div>
                      <div className="font-bold tabular-nums">R$ {c.limit.toFixed(0)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md pe-card p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} data-testid="card-form-close" className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--pe-border)]/50"><X className="h-4 w-4" /></button>
            <h3 className="font-display text-xl font-black mb-5">{t("new_card")}</h3>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("card_name")}</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="pe-input" data-testid="card-name" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("card_last4")}</label>
                <input required maxLength={4} value={form.last4} onChange={(e) => setForm({ ...form, last4: e.target.value.replace(/\D/g, "") })} className="pe-input" data-testid="card-last4" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("card_limit")}</label>
                <input type="number" step="0.01" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} className="pe-input" data-testid="card-limit" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("card_color")}</label>
                <div className="flex gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} data-testid={`card-color-${c}`} className={`h-9 w-9 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-[var(--pe-primary)] ring-offset-[var(--pe-surface)]" : ""}`} style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="pe-btn-outline flex-1 py-2.5">{t("cancel")}</button>
                <button type="submit" data-testid="card-form-submit" className="pe-btn-primary flex-1 py-2.5">{t("save")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
