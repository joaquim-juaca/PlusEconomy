import React, { useEffect, useState } from "react";
import { Plus, Trash2, Target as TargetIcon, X, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { useI18n } from "../contexts/I18nContext";
import { toast } from "sonner";

function fmt(v, lang) {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", { style: "currency", currency: lang === "pt" ? "BRL" : "USD" }).format(v || 0);
}

export default function Goals() {
  const { t, lang } = useI18n();
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", target_amount: "", current_amount: "0", deadline: "" });

  const load = async () => {
    const r = await api.get("/goals");
    setList(r.data);
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/goals", {
        title: form.title,
        target_amount: parseFloat(form.target_amount),
        current_amount: parseFloat(form.current_amount || 0),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        icon: "target",
      });
      setOpen(false);
      setForm({ title: "", target_amount: "", current_amount: "0", deadline: "" });
      toast.success(t("save"));
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || t("error_generic"));
    }
  };

  const contribute = async (id) => {
    const raw = window.prompt(t("contribute") + " (R$)");
    if (!raw) return;
    const amount = parseFloat(raw);
    if (!amount || amount <= 0) return;
    await api.post(`/goals/${id}/contribute`, { amount });
    toast.success(t("save"));
    load();
  };

  const del = async (id) => {
    await api.delete(`/goals/${id}`);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto pb-20" data-testid="goals-page">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight">{t("goals_title")}</h1>
          <p className="text-sm text-[var(--pe-muted)] mt-2">{t("goals_desc")}</p>
        </div>
        <button onClick={() => setOpen(true)} data-testid="goals-new-btn" className="pe-btn-accent px-5 py-2.5 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t("new_goal")}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="pe-card p-10 text-center">
          <TargetIcon className="h-10 w-10 mx-auto mb-3 text-[var(--pe-muted)]" />
          <div className="text-sm text-[var(--pe-muted)]">{t("goals_desc")}</div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {list.map((g, i) => {
            const pct = Math.min((g.current_amount / g.target_amount) * 100, 100);
            const done = pct >= 100;
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="pe-card pe-card-hover p-6 relative"
                data-testid={`goal-${g.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-11 w-11 rounded-xl grid place-items-center ${done ? "bg-[var(--pe-accent)] text-[#FDFCF8]" : "bg-[var(--pe-primary)]/10 text-[var(--pe-primary)]"}`}>
                    {done ? <Trophy className="h-5 w-5" /> : <TargetIcon className="h-5 w-5" />}
                  </div>
                  <button onClick={() => del(g.id)} data-testid={`goal-del-${g.id}`} className="p-2 rounded-full hover:bg-[var(--pe-danger)]/10 text-[var(--pe-muted)] hover:text-[var(--pe-danger)]"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="font-display text-xl font-black mb-1">{g.title}</div>
                <div className="text-xs text-[var(--pe-muted)] mb-3 tabular-nums">
                  {fmt(g.current_amount, lang)} / {fmt(g.target_amount, lang)}
                </div>
                <div className="h-2.5 rounded-full bg-[var(--pe-border)] overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: done ? "var(--pe-accent)" : "var(--pe-primary)",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold" style={{ color: done ? "var(--pe-accent)" : "var(--pe-primary)" }}>
                    {pct.toFixed(0)}% {done && (lang === "pt" ? "· Conquistado!" : "· Achieved!")}
                  </span>
                  <button onClick={() => contribute(g.id)} data-testid={`goal-contrib-${g.id}`} className="pe-btn-outline px-4 py-1.5 text-xs">
                    {t("contribute")}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md pe-card p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--pe-border)]/50"><X className="h-4 w-4" /></button>
            <h3 className="font-display text-xl font-black mb-5">{t("new_goal")}</h3>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("goal_title_lbl")}</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="pe-input" data-testid="goal-title" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("goal_target")}</label>
                <input required type="number" step="0.01" min="0.01" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} className="pe-input" data-testid="goal-target" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("goal_current")}</label>
                <input type="number" step="0.01" min="0" value={form.current_amount} onChange={(e) => setForm({ ...form, current_amount: e.target.value })} className="pe-input" data-testid="goal-current" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("goal_deadline")}</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="pe-input" data-testid="goal-deadline" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="pe-btn-outline flex-1 py-2.5">{t("cancel")}</button>
                <button type="submit" data-testid="goal-form-submit" className="pe-btn-primary flex-1 py-2.5">{t("save")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
