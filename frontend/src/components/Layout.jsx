import React, { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Gauge,
  Target,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Crown,
  Calculator,
} from "lucide-react";

import BottomNav from "./BottomNav";
import Logo from "./Logo";

const navItems = [
  { to: "/dashboard", key: "nav_dashboard", Icon: LayoutDashboard },
  { to: "/transactions", key: "nav_tx", Icon: ArrowLeftRight },
  { to: "/cards", key: "nav_cards", Icon: CreditCard },
  { to: "/limits", key: "nav_limits", Icon: Gauge },
  { to: "/goals", key: "nav_goals", Icon: Target },
  { to: "/investments", key: "nav_invest", Icon: Calculator },
  { to: "/reports", key: "nav_reports", Icon: BarChart3 },
  { to: "/ai", key: "nav_ai", Icon: Sparkles },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { t, lang, setLanguage } = useI18n();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const doLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex" data-testid="app-shell">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-[var(--pe-border)] bg-[var(--pe-surface)] z-30">
        <Link to="/dashboard" className="flex items-center gap-2 px-6 h-20 border-b border-[var(--pe-border)]" data-testid="sidebar-logo">
          <Logo size={40} />
          <div>
            <div className="font-display text-lg font-black tracking-tight">PlusEconomy</div>
            {user?.is_premium && (
              <span className="pe-chip" style={{ background: "var(--pe-accent)", color: "#FDFCF8" }}>
                <Crown className="h-3 w-3" /> Premium
              </span>
            )}
          </div>
        </Link>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, key, Icon }) => (
            <NavLink
              key={to}
              to={to}
              data-testid={`nav-${key}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[var(--pe-primary)] text-[#FDFCF8]"
                    : "text-[var(--pe-text)] hover:bg-[var(--pe-border)]/40"
                }`
              }
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {t(key)}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-4 space-y-1 border-t border-[var(--pe-border)] pt-3">
          {!user?.is_premium && (
            <NavLink
              to="/upgrade"
              data-testid="nav-upgrade"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold bg-[var(--pe-accent)] text-[#FDFCF8] hover:bg-[var(--pe-accent-hover)] transition-all"
            >
              <Crown className="h-4 w-4" /> {t("nav_upgrade")}
            </NavLink>
          )}
          <NavLink
            to="/settings"
            data-testid="nav-settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive ? "bg-[var(--pe-primary)] text-[#FDFCF8]" : "hover:bg-[var(--pe-border)]/40"
              }`
            }
          >
            <Settings className="h-4 w-4" /> {t("nav_settings")}
          </NavLink>
          <button
            onClick={doLogout}
            data-testid="sidebar-logout-btn"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--pe-border)]/40 transition-all text-[var(--pe-muted)]"
          >
            <LogOut className="h-4 w-4" /> {t("logout")}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-16 px-4 flex items-center justify-between bg-[var(--pe-surface)]/85 backdrop-blur-xl border-b border-[var(--pe-border)]">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Logo size={34} />
          <span className="font-display font-black tracking-tight">PlusEconomy</span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggle} data-testid="mobile-theme-toggle" className="p-2 rounded-full hover:bg-[var(--pe-border)]/50">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setLanguage(lang === "pt" ? "en" : "pt")}
            data-testid="mobile-lang-toggle"
            className="px-2 py-1 rounded-full text-xs font-bold border border-[var(--pe-border)]"
          >
            {lang.toUpperCase()}
          </button>
          <button onClick={() => setMenuOpen(true)} data-testid="mobile-menu-open" className="p-2 rounded-full hover:bg-[var(--pe-border)]/50">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile slide-over menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 bg-[var(--pe-surface)] p-4 border-l border-[var(--pe-border)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-black">Menu</span>
              <button onClick={() => setMenuOpen(false)} data-testid="mobile-menu-close" className="p-2 rounded-full hover:bg-[var(--pe-border)]/50">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              {navItems.map(({ to, key, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  data-testid={`mnav-${key}`}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                      isActive ? "bg-[var(--pe-primary)] text-[#FDFCF8]" : "hover:bg-[var(--pe-border)]/40"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" /> {t(key)}
                </NavLink>
              ))}
              <NavLink to="/upgrade" onClick={() => setMenuOpen(false)} data-testid="mnav-upgrade" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-[var(--pe-accent)] text-[#FDFCF8]">
                <Crown className="h-4 w-4" /> {t("nav_upgrade")}
              </NavLink>
              <NavLink to="/settings" onClick={() => setMenuOpen(false)} data-testid="mnav-settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[var(--pe-border)]/40">
                <Settings className="h-4 w-4" /> {t("nav_settings")}
              </NavLink>
              <button onClick={() => { setMenuOpen(false); doLogout(); }} data-testid="mobile-logout-btn" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[var(--pe-border)]/40 text-[var(--pe-muted)]">
                <LogOut className="h-4 w-4" /> {t("logout")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 pb-24 lg:pb-8 min-h-screen">
        {/* Desktop top utility bar */}
        <div className="hidden lg:flex sticky top-0 z-20 items-center justify-end gap-2 h-14 px-8 bg-[var(--pe-bg)]/80 backdrop-blur-xl border-b border-[var(--pe-border)]">
          <button
            onClick={() => setLanguage(lang === "pt" ? "en" : "pt")}
            data-testid="desktop-lang-toggle"
            className="px-3 py-1 rounded-full text-xs font-bold border border-[var(--pe-border)] hover:border-[var(--pe-primary)] transition-colors"
          >
            {lang === "pt" ? "PT-BR" : "EN"}
          </button>
          <button onClick={toggle} data-testid="desktop-theme-toggle" className="p-2 rounded-full hover:bg-[var(--pe-border)]/50 transition-colors">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-[var(--pe-border)] ml-2">
            {user?.picture ? (
              <img src={user.picture} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[var(--pe-primary)] text-[#FDFCF8] grid place-items-center text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <span className="text-sm font-semibold">{user?.name}</span>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-10 pt-6 lg:pt-8">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
