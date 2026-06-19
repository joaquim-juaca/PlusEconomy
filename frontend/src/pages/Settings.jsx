import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { useTheme } from "../contexts/ThemeContext";
import { LogOut, Moon, Sun, Crown, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, logout } = useAuth();
  const { t, lang, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const doLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto pb-20" data-testid="settings-page">
      <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight mb-8">{t("settings_title")}</h1>

      <div className="pe-card p-6 mb-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--pe-muted)] mb-4">{t("account")}</div>
        <div className="flex items-center gap-4">
          {user?.picture ? (
            <img src={user.picture} alt="" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-[var(--pe-primary)] text-[#FDFCF8] grid place-items-center">
              <User className="h-6 w-6" />
            </div>
          )}
          <div className="flex-1">
            <div className="font-display text-lg font-bold">{user?.name}</div>
            <div className="text-sm text-[var(--pe-muted)]">{user?.email}</div>
          </div>
          {user?.is_premium && (
            <span className="pe-chip" style={{ background: "var(--pe-accent)", color: "#FDFCF8" }}>
              <Crown className="h-3 w-3" /> Premium
            </span>
          )}
        </div>
      </div>

      <div className="pe-card p-6 mb-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--pe-muted)] mb-4">{t("language")}</div>
        <div className="inline-flex p-1 rounded-full bg-[var(--pe-border)]/40">
          {["pt", "en"].map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              data-testid={`settings-lang-${l}`}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${lang === l ? "bg-[var(--pe-primary)] text-[#FDFCF8]" : "text-[var(--pe-muted)]"}`}
            >
              {l === "pt" ? "Português" : "English"}
            </button>
          ))}
        </div>
      </div>

      <div className="pe-card p-6 mb-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--pe-muted)] mb-4">{t("theme")}</div>
        <div className="inline-flex p-1 rounded-full bg-[var(--pe-border)]/40">
          <button onClick={() => setTheme("light")} data-testid="settings-theme-light" className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${theme === "light" ? "bg-[var(--pe-primary)] text-[#FDFCF8]" : "text-[var(--pe-muted)]"}`}>
            <Sun className="h-3.5 w-3.5" /> {t("light")}
          </button>
          <button onClick={() => setTheme("dark")} data-testid="settings-theme-dark" className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${theme === "dark" ? "bg-[var(--pe-primary)] text-[#FDFCF8]" : "text-[var(--pe-muted)]"}`}>
            <Moon className="h-3.5 w-3.5" /> {t("dark")}
          </button>
        </div>
      </div>

      <button onClick={doLogout} data-testid="settings-logout-btn" className="pe-btn-outline px-5 py-3 inline-flex items-center gap-2 text-[var(--pe-danger)] border-[var(--pe-danger)]/30 hover:border-[var(--pe-danger)]">
        <LogOut className="h-4 w-4" /> {t("logout_btn")}
      </button>
    </div>
  );
}
