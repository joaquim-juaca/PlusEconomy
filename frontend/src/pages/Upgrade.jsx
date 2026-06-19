import React, { useState } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { toast } from "sonner";

export default function Upgrade() {
  const { t, lang } = useI18n();
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(false);

  const upgrade = async () => {
    setLoading(true);
    try {
      await api.post("/billing/upgrade");
      toast.success("Premium ativado (mock)");
      await refresh();
    } catch {
      toast.error(t("error_generic"));
    } finally {
      setLoading(false);
    }
  };

  const downgrade = async () => {
    setLoading(true);
    try {
      await api.post("/billing/downgrade");
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20" data-testid="upgrade-page">
      <div className="text-center mb-10">
        <span className="pe-chip bg-[var(--pe-accent)]/15 text-[var(--pe-accent)] mb-4 inline-flex">
          <Crown className="h-3 w-3" /> {t("premium_plan")}
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight">{t("upgrade_title")}</h1>
        <p className="text-sm text-[var(--pe-muted)] mt-3">{t("upgrade_sub")}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="pe-card p-8">
          <div className="font-display text-2xl font-black mb-1">{t("free_plan")}</div>
          <div className="text-sm text-[var(--pe-muted)] mb-6">R$ 0</div>
          <ul className="space-y-3 text-sm mb-8">
            {[t("free_feat_1"), t("free_feat_2"), t("free_feat_3"), t("free_feat_4")].map((f) => (
              <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 text-[var(--pe-success)] mt-0.5" /> {f}</li>
            ))}
          </ul>
          {user?.is_premium ? (
            <button disabled={loading} onClick={downgrade} data-testid="downgrade-btn" className="pe-btn-outline w-full py-3">{t("downgrade_btn")}</button>
          ) : (
            <div className="text-center text-xs font-bold text-[var(--pe-success)] py-3">{lang === "pt" ? "Plano atual" : "Current plan"}</div>
          )}
        </div>

        <div className="pe-card p-8 border-2 border-[var(--pe-accent)] relative">
          <span className="pe-chip absolute -top-3 left-6" style={{ background: "var(--pe-accent)", color: "#FDFCF8" }}>
            <Sparkles className="h-3 w-3" /> {lang === "pt" ? "Recomendado" : "Recommended"}
          </span>
          <div className="font-display text-2xl font-black mb-1">{t("premium_plan")}</div>
          <div className="text-sm text-[var(--pe-muted)] mb-6">R$ 19,90 / {lang === "pt" ? "mês" : "month"}</div>
          <ul className="space-y-3 text-sm mb-8">
            {[t("premium_feat_1"), t("premium_feat_2"), t("premium_feat_3"), t("premium_feat_4")].map((f) => (
              <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 text-[var(--pe-accent)] mt-0.5" /> {f}</li>
            ))}
          </ul>
          {user?.is_premium ? (
            <div className="text-center text-xs font-bold text-[var(--pe-accent)] py-3">{lang === "pt" ? "Plano atual · Premium" : "Current plan · Premium"}</div>
          ) : (
            <button disabled={loading} onClick={upgrade} data-testid="upgrade-btn" className="pe-btn-accent w-full py-3">
              {loading ? "..." : t("upgrade_btn")}
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-center text-[var(--pe-muted)] mt-6">
        {lang === "pt" ? "Upgrade simulado (MVP). Em produção, seria integrado com Stripe." : "Simulated upgrade (MVP). In production, it would be integrated with Stripe."}
      </p>
    </div>
  );
}
