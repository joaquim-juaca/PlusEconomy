import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import TransactionFormDialog from "../components/TransactionFormDialog";

function fmt(v, lang) {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: lang === "pt" ? "BRL" : "USD",
  }).format(v || 0);
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t, tCat, lang } = useI18n();
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [openForm, setOpenForm] = useState(false);

  const load = async () => {
    const [s, ins] = await Promise.all([
      api.get("/dashboard/summary"),
      api.get("/ai/insights"),
    ]);
    setSummary(s.data);
    setInsights(ins.data.tips || []);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = [
    {
      label: t("dash_balance"),
      value: summary ? fmt(summary.balance, lang) : "—",
      Icon: Wallet,
      color: "var(--pe-primary)",
      testid: "stat-balance",
    },
    {
      label: t("dash_income"),
      value: summary ? fmt(summary.income_month, lang) : "—",
      Icon: TrendingUp,
      color: "var(--pe-success)",
      testid: "stat-income",
    },
    {
      label: t("dash_expense"),
      value: summary ? fmt(summary.expense_month, lang) : "—",
      Icon: TrendingDown,
      color: "var(--pe-accent)",
      testid: "stat-expense",
    },
    {
      label: t("dash_tx_count"),
      value: summary ? String(summary.transactions_count) : "—",
      Icon: Receipt,
      color: "var(--pe-warning)",
      testid: "stat-count",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20" data-testid="dashboard-page">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--pe-muted)] mb-2">
            {t("dash_hello")}, {user?.name?.split(" ")[0]}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            {lang === "pt" ? "Seu painel" : "Your dashboard"}
          </h1>
        </div>
        <button
          onClick={() => setOpenForm(true)}
          data-testid="dashboard-new-tx-btn"
          className="pe-btn-accent px-5 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> {t("new_tx")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="pe-card p-5"
            data-testid={s.testid}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-9 w-9 rounded-xl grid place-items-center" style={{ background: `${s.color}15`, color: s.color }}>
                <s.Icon className="h-4 w-4" strokeWidth={2} />
              </div>
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--pe-muted)]">{s.label}</div>
            <div className="font-display text-xl sm:text-2xl font-black mt-1">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <div className="lg:col-span-2 pe-card p-6">
          <h2 className="font-display text-lg font-bold mb-4">{t("dash_by_cat")}</h2>
          {summary && summary.categories.length > 0 ? (
            <div className="grid md:grid-cols-5 gap-6 items-center">
              <div className="md:col-span-2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.categories}
                      dataKey="total"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {summary.categories.map((c, i) => (
                        <Cell key={i} fill={c.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => fmt(v, lang)}
                      contentStyle={{ background: "var(--pe-surface)", border: "1px solid var(--pe-border)", borderRadius: 12, color: "var(--pe-text)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="md:col-span-3 space-y-2">
                {summary.categories.slice(0, 6).map((c) => {
                  const total = summary.categories.reduce((a, b) => a + b.total, 0) || 1;
                  const pct = Math.round((c.total / total) * 100);
                  return (
                    <div key={c.name} className="flex items-center gap-3" data-testid={`dash-cat-${c.name}`}>
                      <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span>{tCat(c.name)}</span>
                          <span className="tabular-nums">{fmt(c.total, lang)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[var(--pe-border)] mt-1 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-sm text-[var(--pe-muted)] py-12 text-center">{t("dash_no_tx")}</div>
          )}
        </div>

        {/* AI Insights */}
        <div className="pe-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-[var(--pe-accent)]" />
            <h2 className="font-display text-lg font-bold">Insights</h2>
          </div>
          <div className="space-y-3">
            {insights.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="p-3 rounded-xl bg-[var(--pe-primary)]/5 border border-[var(--pe-primary)]/15"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--pe-primary)] mb-1">{tip.title}</div>
                <div className="text-sm">{tip.body}</div>
              </motion.div>
            ))}
          </div>
          {!user?.is_premium && (
            <Link to="/upgrade" data-testid="dash-ai-upgrade-link" className="mt-5 block p-4 rounded-xl bg-[var(--pe-accent)]/10 border border-[var(--pe-accent)]/25 hover:bg-[var(--pe-accent)]/15 transition-colors">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--pe-accent)]">PlusCoach</div>
              <div className="text-sm mt-1">{t("premium_locked")}</div>
              <div className="mt-2 text-xs font-bold flex items-center gap-1 text-[var(--pe-accent)]">{t("go_premium")} <ArrowRight className="h-3 w-3" /></div>
            </Link>
          )}
          {user?.is_premium && (
            <Link to="/ai" data-testid="dash-ai-open-link" className="mt-5 block p-4 rounded-xl bg-[var(--pe-accent)] text-[#FDFCF8] hover:bg-[var(--pe-accent-hover)] transition-colors">
              <div className="text-sm font-bold flex items-center gap-2"><Sparkles className="h-4 w-4" /> {lang === "pt" ? "Abrir PlusCoach" : "Open PlusCoach"}</div>
            </Link>
          )}
        </div>
      </div>

      {/* Recent */}
      <div className="pe-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold">{t("dash_recent")}</h2>
          <Link to="/transactions" data-testid="dash-see-all-link" className="text-xs font-bold text-[var(--pe-primary)] hover:underline flex items-center gap-1">
            {t("dash_see_all")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {summary && summary.recent.length > 0 ? (
          <div className="divide-y divide-[var(--pe-border)]">
            {summary.recent.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3" data-testid={`recent-tx-${tx.id}`}>
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl grid place-items-center"
                    style={{
                      background: tx.type === "income" ? "var(--pe-success)15" : "var(--pe-accent)15",
                      color: tx.type === "income" ? "var(--pe-success)" : "var(--pe-accent)",
                    }}
                  >
                    {tx.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{tCat(tx.category)}</div>
                    <div className="text-xs text-[var(--pe-muted)]">{tx.description || (tx.type === "income" ? t("income") : t("expense"))}</div>
                  </div>
                </div>
                <div className={`font-display font-bold tabular-nums ${tx.type === "income" ? "text-[var(--pe-success)]" : "text-[var(--pe-accent)]"}`}>
                  {tx.type === "income" ? "+" : "-"} {fmt(tx.amount, lang)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-[var(--pe-muted)] py-8 text-center">{t("dash_no_tx")}</div>
        )}
      </div>

      <TransactionFormDialog open={openForm} onClose={() => setOpenForm(false)} onSaved={load} />
    </div>
  );
}
