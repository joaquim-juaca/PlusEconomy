import React from "react";
import { Crown } from "lucide-react";
import { useI18n } from "../contexts/I18nContext";
import { Link } from "react-router-dom";

export default function PremiumGate({ children }) {
  const { t } = useI18n();
  return (
    <div className="relative" data-testid="premium-gate">
      <div className="filter blur-sm pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 grid place-items-center">
        <div className="pe-card p-8 max-w-md text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-[var(--pe-accent)]/15 grid place-items-center mb-4">
            <Crown className="h-6 w-6 text-[var(--pe-accent)]" />
          </div>
          <div className="font-display text-2xl font-black mb-2">{t("premium_feature")}</div>
          <p className="text-sm text-[var(--pe-muted)] mb-6">{t("premium_locked")}</p>
          <Link to="/upgrade" data-testid="premium-gate-cta" className="pe-btn-accent inline-block px-6 py-2.5 text-sm">
            {t("go_premium")}
          </Link>
        </div>
      </div>
    </div>
  );
}
