import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Calculator,
  Sparkles,
  Settings,
} from "lucide-react";
import { useI18n } from "../contexts/I18nContext";

const items = [
  { to: "/dashboard", key: "nav_dashboard", Icon: LayoutDashboard },
  { to: "/transactions", key: "nav_tx", Icon: ArrowLeftRight },
  { to: "/investments", key: "nav_invest", Icon: Calculator },
  { to: "/ai", key: "nav_ai", Icon: Sparkles },
  { to: "/settings", key: "nav_settings", Icon: Settings },
];

export default function BottomNav() {
  const { t } = useI18n();
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 px-2 bg-[var(--pe-surface)]/95 backdrop-blur-xl border-t border-[var(--pe-border)] flex items-center justify-around"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      data-testid="bottom-nav"
    >
      {items.map(({ to, key, Icon }) => (
        <NavLink
          key={to}
          to={to}
          data-testid={`bnav-${key}`}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-bold transition-colors ${
              isActive ? "text-[var(--pe-primary)]" : "text-[var(--pe-muted)]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-2 rounded-xl transition-all ${isActive ? "bg-[var(--pe-primary)]/10" : ""}`}>
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
              <span className="leading-none">{t(key)}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
