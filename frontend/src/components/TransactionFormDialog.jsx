import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useI18n, CATEGORIES_EXPENSE, CATEGORIES_INCOME } from "../contexts/I18nContext";
import { toast } from "sonner";
import { X } from "lucide-react";

export default function TransactionFormDialog({ open, onClose, onSaved, initial }) {
  const { t, tCat } = useI18n();
  const [type, setType] = useState(initial?.type || "expense");
  const [amount, setAmount] = useState(initial?.amount || "");
  const [category, setCategory] = useState(initial?.category || "Alimentação");
  const [description, setDescription] = useState(initial?.description || "");
  const [cardId, setCardId] = useState(initial?.card_id || "");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      api.get("/cards").then((r) => setCards(r.data)).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    // switch default category when type flips
    if (type === "income" && !CATEGORIES_INCOME.includes(category)) setCategory("Salário");
    if (type === "expense" && !CATEGORIES_EXPENSE.includes(category)) setCategory("Alimentação");
  }, [type]); // eslint-disable-line

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        type,
        amount: parseFloat(amount),
        category,
        description,
        card_id: cardId || null,
      };
      if (initial?.id) {
        await api.put(`/transactions/${initial.id}`, payload);
      } else {
        await api.post("/transactions", payload);
      }
      toast.success(t("save"));
      onSaved && onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || t("error_generic"));
    } finally {
      setLoading(false);
    }
  };

  const cats = type === "expense" ? CATEGORIES_EXPENSE : CATEGORIES_INCOME;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={onClose} data-testid="tx-form-dialog">
      <div className="w-full max-w-md pe-card p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} data-testid="tx-form-close" className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--pe-border)]/50">
          <X className="h-4 w-4" />
        </button>
        <h3 className="font-display text-xl font-black mb-1">{t("new_tx")}</h3>
        <p className="text-xs text-[var(--pe-muted)] mb-5">{t("quick_add")}</p>

        <div className="grid grid-cols-2 p-1 rounded-full bg-[var(--pe-border)]/40 mb-5">
          <button type="button" onClick={() => setType("expense")} data-testid="tx-type-expense" className={`py-2 rounded-full text-sm font-bold transition-all ${type === "expense" ? "bg-[var(--pe-accent)] text-[#FDFCF8]" : "text-[var(--pe-muted)]"}`}>{t("expense")}</button>
          <button type="button" onClick={() => setType("income")} data-testid="tx-type-income" className={`py-2 rounded-full text-sm font-bold transition-all ${type === "income" ? "bg-[var(--pe-success)] text-[#FDFCF8]" : "text-[var(--pe-muted)]"}`}>{t("income")}</button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("amount")}</label>
            <input type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="pe-input text-lg font-display font-bold" data-testid="tx-amount" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("category")}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="pe-input" data-testid="tx-category">
              {cats.map((c) => (
                <option key={c} value={c}>{tCat(c)}</option>
              ))}
            </select>
          </div>
          {type === "expense" && cards.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("card")}</label>
              <select value={cardId} onChange={(e) => setCardId(e.target.value)} className="pe-input" data-testid="tx-card">
                <option value="">{t("no_card")}</option>
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} · {c.last4}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1 block">{t("description")}</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="pe-input" data-testid="tx-description" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} data-testid="tx-form-cancel" className="pe-btn-outline flex-1 py-2.5">{t("cancel")}</button>
            <button type="submit" disabled={loading} data-testid="tx-form-submit" className="pe-btn-primary flex-1 py-2.5 disabled:opacity-60">{loading ? "..." : t("save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
