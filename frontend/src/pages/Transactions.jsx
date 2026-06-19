import React, { useEffect, useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { api } from "../lib/api";
import { useI18n } from "../contexts/I18nContext";
import TransactionFormDialog from "../components/TransactionFormDialog";
import { toast } from "sonner";

function fmt(v, lang) {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: lang === "pt" ? "BRL" : "USD",
  }).format(v || 0);
}

export default function Transactions() {
  const { t, tCat, lang } = useI18n();
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const load = async () => {
    const q = filter === "all" ? "" : `?type=${filter}`;
    const r = await api.get("/transactions" + q);
    setList(r.data);
  };
  useEffect(() => {
    load();
  }, [filter]);

  const del = async (id) => {
    await api.delete(`/transactions/${id}`);
    toast.success(t("delete"));
    load();
  };

  return (
    <div className="max-w-5xl mx-auto pb-20" data-testid="transactions-page">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight">{t("tx_title")}</h1>
          <p className="text-sm text-[var(--pe-muted)] mt-2">{list.length} {lang === "pt" ? "registros" : "records"}</p>
        </div>
        <button onClick={() => setOpen(true)} data-testid="tx-new-btn" className="pe-btn-accent px-5 py-2.5 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t("new_tx")}
        </button>
      </div>

      <div className="inline-flex p-1 rounded-full bg-[var(--pe-border)]/40 mb-6">
        {[
          { k: "all", l: t("tx_filter_all") },
          { k: "income", l: t("filter_income") },
          { k: "expense", l: t("filter_expense") },
        ].map((o) => (
          <button
            key={o.k}
            onClick={() => setFilter(o.k)}
            data-testid={`tx-filter-${o.k}`}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === o.k ? "bg-[var(--pe-primary)] text-[#FDFCF8]" : "text-[var(--pe-muted)]"}`}
          >
            {o.l}
          </button>
        ))}
      </div>

      <div className="pe-card divide-y divide-[var(--pe-border)]">
        {list.length === 0 && (
          <div className="p-8 text-center text-sm text-[var(--pe-muted)]">{t("dash_no_tx")}</div>
        )}
        {list.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-[var(--pe-border)]/20 transition-colors" data-testid={`tx-row-${tx.id}`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl grid place-items-center" style={{
                background: tx.type === "income" ? "var(--pe-success)15" : "var(--pe-accent)15",
                color: tx.type === "income" ? "var(--pe-success)" : "var(--pe-accent)",
              }}>
                {tx.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </div>
              <div>
                <div className="font-semibold">{tCat(tx.category)}</div>
                <div className="text-xs text-[var(--pe-muted)]">{tx.description || "—"} · {new Date(tx.date).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US")}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`font-display font-bold tabular-nums ${tx.type === "income" ? "text-[var(--pe-success)]" : "text-[var(--pe-accent)]"}`}>
                {tx.type === "income" ? "+" : "-"} {fmt(tx.amount, lang)}
              </div>
              <button onClick={() => del(tx.id)} data-testid={`tx-del-${tx.id}`} className="p-2 rounded-full hover:bg-[var(--pe-danger)]/10 text-[var(--pe-muted)] hover:text-[var(--pe-danger)] transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <TransactionFormDialog open={open} onClose={() => setOpen(false)} onSaved={load} />
    </div>
  );
}
