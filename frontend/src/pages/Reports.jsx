import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../lib/api";
import { useI18n } from "../contexts/I18nContext";
import { useAuth } from "../contexts/AuthContext";
import PremiumGate from "../components/PremiumGate";

function fmt(v, lang) {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", { style: "currency", currency: lang === "pt" ? "BRL" : "USD" }).format(v || 0);
}

export default function Reports() {
  const { t, tCat, lang } = useI18n();
  const { user } = useAuth();
  const [series, setSeries] = useState([]);
  const [cats, setCats] = useState([]);
  const [period, setPeriod] = useState("month");

  const load = async () => {
    const [s, c] = await Promise.all([
      api.get("/reports/timeseries?months=6"),
      api.get(`/reports/by-category?period=${period}`),
    ]);
    setSeries(s.data);
    setCats(c.data);
  };

  useEffect(() => {
    load();
  }, [period]);

  const inner = (
    <div className="max-w-6xl mx-auto pb-20" data-testid="reports-page">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight">{t("reports_title")}</h1>
        <div className="inline-flex p-1 rounded-full bg-[var(--pe-border)]/40 mt-4">
          {["week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              data-testid={`reports-period-${p}`}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${period === p ? "bg-[var(--pe-primary)] text-[#FDFCF8]" : "text-[var(--pe-muted)]"}`}
            >
              {p === "week" ? (lang === "pt" ? "Semana" : "Week") : p === "month" ? (lang === "pt" ? "Mês" : "Month") : (lang === "pt" ? "Ano" : "Year")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="pe-card p-6">
          <h2 className="font-display text-lg font-bold mb-4">{lang === "pt" ? "Receitas x Despesas (6 meses)" : "Income vs Expenses (6 months)"}</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid stroke="var(--pe-border)" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="var(--pe-muted)" fontSize={12} />
                <YAxis stroke="var(--pe-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--pe-surface)", border: "1px solid var(--pe-border)", borderRadius: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="var(--pe-primary)" strokeWidth={2.5} name={t("income")} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expense" stroke="var(--pe-accent)" strokeWidth={2.5} name={t("expense")} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pe-card p-6">
          <h2 className="font-display text-lg font-bold mb-4">{lang === "pt" ? "Despesas por categoria" : "Expenses by category"}</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cats} dataKey="total" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {cats.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={(v, _n, p) => [fmt(v, lang), tCat(p.payload.name)]} contentStyle={{ background: "var(--pe-surface)", border: "1px solid var(--pe-border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pe-card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold mb-4">{lang === "pt" ? "Ranking de categorias" : "Category ranking"}</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="var(--pe-border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="var(--pe-muted)" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="var(--pe-muted)" fontSize={12} width={110} tickFormatter={(v) => tCat(v)} />
                <Tooltip formatter={(v) => fmt(v, lang)} contentStyle={{ background: "var(--pe-surface)", border: "1px solid var(--pe-border)", borderRadius: 12 }} />
                <Bar dataKey="total" radius={[0, 8, 8, 0]}>
                  {cats.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user?.is_premium) return <PremiumGate>{inner}</PremiumGate>;
  return inner;
}
