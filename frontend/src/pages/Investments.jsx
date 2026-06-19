import React, { useEffect, useMemo, useState } from "react";
import {
  Calculator,
  TrendingUp,
  Coins,
  Wallet,
  Sparkles,
  Save,
  Trash2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { useI18n } from "../contexts/I18nContext";
import { toast } from "sonner";

function fmt(v, lang) {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: lang === "pt" ? "BRL" : "USD",
  }).format(v || 0);
}

const PRESETS = [
  { label: "Poupança", initial: 1000, monthly: 200, rate: 6.5, period: "annual", duration: 5, durUnit: "years", type: "compound" },
  { label: "CDB 100%", initial: 5000, monthly: 500, rate: 12, period: "annual", duration: 3, durUnit: "years", type: "compound" },
  { label: "Tesouro", initial: 2000, monthly: 300, rate: 11.5, period: "annual", duration: 10, durUnit: "years", type: "compound" },
];

export default function Investments() {
  const { t, lang } = useI18n();
  const [form, setForm] = useState({
    initial_amount: 1000,
    monthly_contribution: 200,
    interest_rate: 10,
    rate_period: "annual",
    duration: 5,
    duration_unit: "years",
    interest_type: "compound",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState([]);

  const loadSaved = async () => {
    try {
      const r = await api.get("/investments/saved");
      setSaved(r.data);
    } catch {}
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const simulate = async (overrideForm) => {
    setLoading(true);
    try {
      const payload = overrideForm || form;
      const r = await api.post("/investments/simulate", {
        initial_amount: parseFloat(payload.initial_amount),
        monthly_contribution: parseFloat(payload.monthly_contribution || 0),
        interest_rate: parseFloat(payload.interest_rate),
        rate_period: payload.rate_period,
        duration: parseInt(payload.duration, 10),
        duration_unit: payload.duration_unit,
        interest_type: payload.interest_type,
      });
      setResult(r.data);
    } catch (err) {
      toast.error(err?.response?.data?.detail || t("error_generic"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    simulate();
    // eslint-disable-next-line
  }, []);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    simulate();
  };

  const save = async () => {
    try {
      await api.post("/investments/save", {
        initial_amount: parseFloat(form.initial_amount),
        monthly_contribution: parseFloat(form.monthly_contribution || 0),
        interest_rate: parseFloat(form.interest_rate),
        rate_period: form.rate_period,
        duration: parseInt(form.duration, 10),
        duration_unit: form.duration_unit,
        interest_type: form.interest_type,
      });
      toast.success(lang === "pt" ? "Simulação salva" : "Simulation saved");
      loadSaved();
    } catch {
      toast.error(t("error_generic"));
    }
  };

  const delSaved = async (id) => {
    await api.delete(`/investments/saved/${id}`);
    loadSaved();
  };

  const chartData = useMemo(() => {
    if (!result) return [];
    const step = Math.max(1, Math.floor(result.rows.length / 24));
    return result.rows
      .filter((_, i) => i % step === 0 || i === result.rows.length - 1)
      .map((r) => ({
        period: r.period,
        invested: r.invested,
        earnings: r.earnings,
        total: r.total,
      }));
  }, [result]);

  const pieData = useMemo(() => {
    if (!result) return [];
    return [
      { name: lang === "pt" ? "Aplicado" : "Invested", value: result.total_invested, color: "var(--pe-primary)" },
      { name: lang === "pt" ? "Rendimentos" : "Earnings", value: result.total_earnings, color: "var(--pe-accent)" },
    ];
  }, [result, lang]);

  const tableRows = useMemo(() => {
    if (!result) return [];
    const months = result.months;
    const picks = new Set([1, 6, 12, 24, 36, 60, 120, months]);
    return result.rows.filter((r) => picks.has(r.period));
  }, [result]);

  return (
    <div className="max-w-7xl mx-auto pb-24" data-testid="investments-page">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-[var(--pe-primary)] text-[#FDFCF8] grid place-items-center">
              <Calculator className="h-5 w-5" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              {lang === "pt" ? "Simulador de Investimentos" : "Investment Simulator"}
            </h1>
          </div>
          <p className="text-sm text-[var(--pe-muted)] ml-[52px] max-w-xl">
            {lang === "pt"
              ? "Projete o crescimento do seu patrimônio. Compare juros simples e compostos, aportes e prazos."
              : "Project the growth of your wealth. Compare simple and compound interest, contributions and timeframes."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              data-testid={`investments-preset-${p.label}`}
              onClick={() => {
                const nf = {
                  initial_amount: p.initial,
                  monthly_contribution: p.monthly,
                  interest_rate: p.rate,
                  rate_period: p.period,
                  duration: p.duration,
                  duration_unit: p.durUnit,
                  interest_type: p.type,
                };
                setForm(nf);
                simulate(nf);
              }}
              className="pe-btn-outline px-3 py-1.5 text-xs"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 mb-6">
        {/* Form */}
        <form onSubmit={submit} className="lg:col-span-5 pe-card p-6 space-y-4 self-start">
          <h2 className="font-display text-lg font-bold mb-1">
            {lang === "pt" ? "Parâmetros" : "Parameters"}
          </h2>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">
              {lang === "pt" ? "Valor inicial" : "Initial amount"}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.initial_amount}
              onChange={(e) => onChange("initial_amount", e.target.value)}
              className="pe-input"
              data-testid="inv-initial"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">
              {lang === "pt" ? "Aporte mensal (opcional)" : "Monthly contribution (optional)"}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.monthly_contribution}
              onChange={(e) => onChange("monthly_contribution", e.target.value)}
              className="pe-input"
              data-testid="inv-monthly"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">
                {lang === "pt" ? "Taxa de juros (%)" : "Interest rate (%)"}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.interest_rate}
                onChange={(e) => onChange("interest_rate", e.target.value)}
                className="pe-input"
                data-testid="inv-rate"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">
                {lang === "pt" ? "Período" : "Period"}
              </label>
              <select
                value={form.rate_period}
                onChange={(e) => onChange("rate_period", e.target.value)}
                className="pe-input"
                data-testid="inv-rate-period"
              >
                <option value="monthly">{lang === "pt" ? "Mensal" : "Monthly"}</option>
                <option value="annual">{lang === "pt" ? "Anual" : "Annual"}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">
                {lang === "pt" ? "Duração" : "Duration"}
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.duration}
                onChange={(e) => onChange("duration", e.target.value)}
                className="pe-input"
                data-testid="inv-duration"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">
                {lang === "pt" ? "Unidade" : "Unit"}
              </label>
              <select
                value={form.duration_unit}
                onChange={(e) => onChange("duration_unit", e.target.value)}
                className="pe-input"
                data-testid="inv-duration-unit"
              >
                <option value="months">{lang === "pt" ? "Meses" : "Months"}</option>
                <option value="years">{lang === "pt" ? "Anos" : "Years"}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-2 block">
              {lang === "pt" ? "Tipo de juros" : "Interest type"}
            </label>
            <div className="grid grid-cols-2 p-1 rounded-full bg-[var(--pe-border)]/40">
              <button
                type="button"
                onClick={() => onChange("interest_type", "compound")}
                data-testid="inv-type-compound"
                className={`py-2 rounded-full text-sm font-bold transition-all ${
                  form.interest_type === "compound"
                    ? "bg-[var(--pe-primary)] text-[#FDFCF8]"
                    : "text-[var(--pe-muted)]"
                }`}
              >
                {lang === "pt" ? "Compostos" : "Compound"}
              </button>
              <button
                type="button"
                onClick={() => onChange("interest_type", "simple")}
                data-testid="inv-type-simple"
                className={`py-2 rounded-full text-sm font-bold transition-all ${
                  form.interest_type === "simple"
                    ? "bg-[var(--pe-primary)] text-[#FDFCF8]"
                    : "text-[var(--pe-muted)]"
                }`}
              >
                {lang === "pt" ? "Simples" : "Simple"}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              data-testid="inv-simulate-btn"
              className="pe-btn-primary flex-1 py-3 disabled:opacity-60"
            >
              {loading ? "..." : lang === "pt" ? "Simular" : "Simulate"}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!result}
              data-testid="inv-save-btn"
              className="pe-btn-outline px-4 py-3 flex items-center gap-2 disabled:opacity-40"
            >
              <Save className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Result KPIs */}
        <div className="lg:col-span-7 space-y-4">
          {result && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pe-card p-4"
                  data-testid="inv-kpi-invested"
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-2">
                    <Wallet className="h-3 w-3" /> {lang === "pt" ? "Investido" : "Invested"}
                  </div>
                  <div className="font-display text-lg font-black tabular-nums">{fmt(result.total_invested, lang)}</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="pe-card p-4"
                  data-testid="inv-kpi-earnings"
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-2">
                    <Coins className="h-3 w-3" /> {lang === "pt" ? "Rendimentos" : "Earnings"}
                  </div>
                  <div className="font-display text-lg font-black tabular-nums text-[var(--pe-accent)]">
                    {fmt(result.total_earnings, lang)}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl p-4 border"
                  style={{ background: "var(--pe-primary)", color: "#FDFCF8", borderColor: "var(--pe-primary)" }}
                  data-testid="inv-kpi-final"
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-80 mb-2">
                    <TrendingUp className="h-3 w-3" /> {lang === "pt" ? "Valor final" : "Final amount"}
                  </div>
                  <div className="font-display text-lg font-black tabular-nums">{fmt(result.final_amount, lang)}</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="pe-card p-4"
                  data-testid="inv-kpi-rate"
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-2">
                    <Sparkles className="h-3 w-3" /> {lang === "pt" ? "Taxa mensal" : "Monthly rate"}
                  </div>
                  <div className="font-display text-lg font-black tabular-nums">{result.monthly_rate}%</div>
                </motion.div>
              </div>

              {/* Growth chart */}
              <div className="pe-card p-6">
                <h2 className="font-display text-lg font-bold mb-4">
                  {lang === "pt" ? "Evolução do patrimônio" : "Wealth growth"}
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--pe-primary)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="var(--pe-primary)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gEarn" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--pe-accent)" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="var(--pe-accent)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--pe-border)" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        stroke="var(--pe-muted)"
                        fontSize={11}
                        label={{ value: lang === "pt" ? "Mês" : "Month", position: "insideBottomRight", offset: -3, fill: "var(--pe-muted)", fontSize: 11 }}
                      />
                      <YAxis stroke="var(--pe-muted)" fontSize={11} />
                      <Tooltip
                        formatter={(v) => fmt(v, lang)}
                        contentStyle={{ background: "var(--pe-surface)", border: "1px solid var(--pe-border)", borderRadius: 12 }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="invested"
                        name={lang === "pt" ? "Aplicado" : "Invested"}
                        stroke="var(--pe-primary)"
                        fill="url(#gInv)"
                        strokeWidth={2.5}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name={lang === "pt" ? "Total" : "Total"}
                        stroke="var(--pe-accent)"
                        fill="url(#gEarn)"
                        strokeWidth={2.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {result && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 pe-card p-6">
            <h2 className="font-display text-lg font-bold mb-4">
              {lang === "pt" ? "Aplicado x Rendimentos" : "Invested vs Earnings"}
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {pieData.map((p, i) => (
                      <Cell key={i} fill={p.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => fmt(v, lang)}
                    contentStyle={{ background: "var(--pe-surface)", border: "1px solid var(--pe-border)", borderRadius: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {pieData.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                    {p.name}
                  </span>
                  <span className="font-bold tabular-nums">{fmt(p.value, lang)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 pe-card p-6 overflow-hidden">
            <h2 className="font-display text-lg font-bold mb-4">
              {lang === "pt" ? "Projeção por período" : "Projection by period"}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="inv-projection-table">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] border-b border-[var(--pe-border)]">
                    <th className="py-3 pr-3">{lang === "pt" ? "Período" : "Period"}</th>
                    <th className="py-3 pr-3">{lang === "pt" ? "Investido" : "Invested"}</th>
                    <th className="py-3 pr-3">{lang === "pt" ? "Rendimentos" : "Earnings"}</th>
                    <th className="py-3 text-right">{lang === "pt" ? "Patrimônio" : "Net worth"}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((r) => (
                    <tr key={r.period} className="border-b border-[var(--pe-border)] last:border-0">
                      <td className="py-3 pr-3 font-bold">
                        {lang === "pt" ? "Mês" : "Month"} {r.period}
                      </td>
                      <td className="py-3 pr-3 tabular-nums">{fmt(r.invested, lang)}</td>
                      <td className="py-3 pr-3 tabular-nums text-[var(--pe-accent)]">{fmt(r.earnings, lang)}</td>
                      <td className="py-3 text-right tabular-nums font-display font-bold">{fmt(r.total, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {saved.length > 0 && (
        <div className="mt-8 pe-card p-6">
          <h2 className="font-display text-lg font-bold mb-4">
            {lang === "pt" ? "Simulações salvas" : "Saved simulations"}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {saved.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-[var(--pe-border)]" data-testid={`saved-sim-${s.id}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs text-[var(--pe-muted)]">{new Date(s.created_at).toLocaleDateString()}</div>
                  <button onClick={() => delSaved(s.id)} className="p-1 rounded-full hover:bg-[var(--pe-danger)]/10 text-[var(--pe-muted)] hover:text-[var(--pe-danger)]">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="font-display font-bold">{fmt(s.summary.final_amount, lang)}</div>
                <div className="text-xs text-[var(--pe-muted)]">
                  {s.params.duration} {s.params.duration_unit === "years" ? (lang === "pt" ? "anos" : "yrs") : (lang === "pt" ? "meses" : "mo")} · {s.params.interest_rate}% {s.params.rate_period === "annual" ? "a.a." : "a.m."}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
