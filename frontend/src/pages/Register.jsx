import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../contexts/I18nContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
function googleLogin() {
  const redirectUrl = window.location.origin + "/dashboard";
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
}

export default function Register() {
  const { t } = useI18n();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, name);
      toast.success(t("welcome_cta"));
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || t("error_generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" data-testid="register-page">
      <div className="flex items-center justify-center p-6 sm:p-10 order-2 lg:order-1">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <img src="/logo-icon.png" alt="PlusEconomy" width="38" height="38" className="rounded-[20%]" />
            <span className="font-display text-xl font-black tracking-tight">PlusEconomy</span>
          </Link>
          <div className="mb-8">
            <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight">{t("register_title")}</h1>
            <p className="text-sm text-[var(--pe-muted)] mt-2">{t("register_sub")}</p>
          </div>

          <button
            onClick={googleLogin}
            data-testid="register-google-btn"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-full border-[1.5px] border-[var(--pe-border)] hover:border-[var(--pe-primary)] transition-colors font-semibold text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {t("continue_with_google")}
          </button>

          <div className="flex items-center gap-3 my-6 text-xs text-[var(--pe-muted)]">
            <div className="flex-1 h-px bg-[var(--pe-border)]" />
            {t("or")}
            <div className="flex-1 h-px bg-[var(--pe-border)]" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1.5 block">{t("name")}</label>
              <input required value={name} onChange={(e)=>setName(e.target.value)} className="pe-input" data-testid="register-name" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1.5 block">{t("email")}</label>
              <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="pe-input" data-testid="register-email" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--pe-muted)] mb-1.5 block">{t("password")}</label>
              <input type="password" required minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} className="pe-input" data-testid="register-password" />
            </div>
            <button type="submit" disabled={loading} data-testid="register-submit" className="pe-btn-accent w-full py-3 mt-2 disabled:opacity-60">
              {loading ? "..." : t("cta_start")}
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-[var(--pe-muted)]">
            {t("has_account")}{" "}
            <Link to="/login" data-testid="register-login-link" className="text-[var(--pe-primary)] font-bold hover:underline">
              {t("cta_login")}
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative overflow-hidden bg-[var(--pe-accent)] order-1 lg:order-2">
        <div className="absolute inset-0 pe-grain" />
        <div className="relative h-full flex flex-col justify-between p-12 text-[#FDFCF8]">
          <div />
          <div>
            <div className="font-display text-3xl font-black leading-tight max-w-md">
              {t("hero_desc")}
            </div>
            <div className="text-sm opacity-80 mt-3">— PlusEconomy</div>
          </div>
        </div>
      </div>
    </div>
  );
}
