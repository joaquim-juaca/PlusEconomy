import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Wallet,
  PieChart,
  Sparkles,
  ShieldCheck,
  Target,
  ArrowRight,
  Crown,
  Check,
} from "lucide-react";
import { useI18n } from "../contexts/I18nContext";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";
import Logo from "../components/Logo";

export default function Landing() {
  const { t, lang, setLanguage } = useI18n();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  const features = [
    {
      icon: Wallet,
      title: lang === "pt" ? "Tudo em um lugar" : "All in one place",
      body: lang === "pt"
        ? "Receitas, despesas, cartões e metas num painel único."
        : "Income, expenses, cards and goals on a single dashboard.",
    },
    {
      icon: Sparkles,
      title: "PlusCoach IA",
      body: lang === "pt"
        ? "Um coach com IA que lê seus dados e te diz onde economizar."
        : "An AI coach that reads your data and shows you where to save.",
    },
    {
      icon: Target,
      title: lang === "pt" ? "Metas gamificadas" : "Gamified goals",
      body: lang === "pt"
        ? "Progresso visual, conquistas e motivação para conquistar seus sonhos."
        : "Visual progress, achievements and motivation to reach your dreams.",
    },
    {
      icon: ShieldCheck,
      title: lang === "pt" ? "Limites inteligentes" : "Smart limits",
      body: lang === "pt"
        ? "Alertas em tempo real quando seus gastos estão fugindo do controle."
        : "Real-time alerts when your spending gets out of control.",
    },
  ];

  return (
    <div className="min-h-screen" data-testid="landing-page">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--pe-bg)]/80 border-b border-[var(--pe-border)]">
        <div className="max-w-7xl mx-auto h-16 px-5 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="landing-logo">
            <Logo size={38} />
            <span className="font-display text-xl font-black tracking-tight">PlusEconomy</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a href="#features" className="hover:text-[var(--pe-primary)]" data-testid="landing-nav-features">{t("features")}</a>
            <a href="#pricing" className="hover:text-[var(--pe-primary)]" data-testid="landing-nav-pricing">{t("pricing")}</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(lang === "pt" ? "en" : "pt")}
              data-testid="landing-lang-toggle"
              className="px-3 py-1 rounded-full text-xs font-bold border border-[var(--pe-border)] hover:border-[var(--pe-primary)] transition-colors"
            >
              {lang === "pt" ? "PT" : "EN"}
            </button>
            <button
              onClick={toggle}
              data-testid="landing-theme-toggle"
              className="p-2 rounded-full hover:bg-[var(--pe-border)]/50 transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {user ? (
              <Link to="/dashboard" data-testid="landing-dashboard-link" className="pe-btn-primary px-5 py-2 text-sm">
                {t("welcome_cta")}
              </Link>
            ) : (
              <>
                <Link to="/login" data-testid="landing-login-link" className="pe-btn-outline px-4 py-2 text-sm hidden sm:inline-block">
                  {t("cta_login")}
                </Link>
                <Link to="/register" data-testid="landing-start-link" className="pe-btn-accent px-5 py-2 text-sm">
                  {t("cta_start")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 pt-16 lg:pt-28 pb-16 lg:pb-24 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7"
        >
          <span className="pe-chip bg-[var(--pe-accent)]/15 text-[var(--pe-accent)] mb-6">
            <Sparkles className="h-3 w-3" /> {lang === "pt" ? "Seu novo aliado financeiro" : "Your new financial ally"}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.02] mb-6">
            {lang === "pt" ? (
              <>
                Domine seu <span className="text-[var(--pe-accent)]">dinheiro</span>, <br />
                sem planilhas chatas.
              </>
            ) : (
              <>
                Master your <span className="text-[var(--pe-accent)]">money</span>, <br />
                without boring spreadsheets.
              </>
            )}
          </h1>
          <p className="text-base lg:text-lg text-[var(--pe-muted)] max-w-xl mb-10 leading-relaxed">
            {t("hero_desc")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/register" data-testid="hero-start-btn" className="pe-btn-accent px-7 py-3.5 inline-flex items-center gap-2">
              {t("cta_start")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" data-testid="hero-login-btn" className="pe-btn-outline px-7 py-3.5">
              {t("cta_login")}
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-xs text-[var(--pe-muted)]">
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--pe-success)]" /> {lang === "pt" ? "Grátis para começar" : "Free to start"}</div>
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--pe-success)]" /> {lang === "pt" ? "Sem cartão de crédito" : "No credit card"}</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="lg:col-span-5 relative"
        >
          <div className="pe-card p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[var(--pe-accent)]/20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[var(--pe-primary)]/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <span className="pe-chip bg-[var(--pe-primary)]/10 text-[var(--pe-primary)]">
                  {lang === "pt" ? "Saldo total" : "Total balance"}
                </span>
                <span className="pe-chip bg-[var(--pe-success)]/15 text-[var(--pe-success)]">
                  <TrendingUp className="h-3 w-3" /> +12,4%
                </span>
              </div>
              <div className="font-display text-4xl font-black tracking-tight mb-1">R$ 8.432,50</div>
              <div className="text-sm text-[var(--pe-muted)] mb-6">
                {lang === "pt" ? "Fevereiro · 2026" : "February · 2026"}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { k: lang === "pt" ? "Alimentação" : "Food", v: "R$ 1.280", c: "var(--pe-accent)" },
                  { k: lang === "pt" ? "Transporte" : "Transport", v: "R$ 480", c: "var(--pe-primary)" },
                  { k: lang === "pt" ? "Lazer" : "Leisure", v: "R$ 310", c: "var(--pe-warning)" },
                ].map((s) => (
                  <div key={s.k} className="pe-card p-3">
                    <div className="h-1.5 w-full rounded-full" style={{ background: s.c, opacity: 0.6 }} />
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[var(--pe-muted)]">{s.k}</div>
                    <div className="font-display font-bold text-sm">{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-3 rounded-xl bg-[var(--pe-accent)]/10 border border-[var(--pe-accent)]/25">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--pe-accent)] mb-1">
                  <Sparkles className="h-3 w-3" /> PlusCoach
                </div>
                <p className="text-sm text-[var(--pe-text)] leading-snug">
                  {lang === "pt"
                    ? "Seus gastos com assinaturas subiram 18%. Quer revisar?"
                    : "Your subscriptions are 18% higher this month. Want to review?"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
        <div className="max-w-2xl mb-12">
          <span className="pe-chip bg-[var(--pe-primary)]/10 text-[var(--pe-primary)] mb-4">
            {t("features")}
          </span>
          <h2 className="font-display text-3xl lg:text-5xl font-black tracking-tight">
            {lang === "pt" ? "Pensado para quem cansou de planilha." : "Built for spreadsheet-tired humans."}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="pe-card pe-card-hover p-7"
              data-testid={`feature-${i}`}
            >
              <div className="h-11 w-11 rounded-xl bg-[var(--pe-primary)]/10 text-[var(--pe-primary)] grid place-items-center mb-5">
                <f.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--pe-muted)] leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
        <div className="max-w-2xl mb-12 text-center mx-auto">
          <span className="pe-chip bg-[var(--pe-accent)]/15 text-[var(--pe-accent)] mb-4">
            {t("pricing")}
          </span>
          <h2 className="font-display text-3xl lg:text-5xl font-black tracking-tight">
            {lang === "pt" ? "Grátis para sempre. Premium quando você quiser." : "Free forever. Premium when you want."}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="pe-card p-8">
            <div className="font-display text-2xl font-black mb-1">{t("free_plan")}</div>
            <div className="text-sm text-[var(--pe-muted)] mb-6">R$ 0 / {lang === "pt" ? "para sempre" : "forever"}</div>
            <ul className="space-y-3 text-sm mb-8">
              {[t("free_feat_1"), t("free_feat_2"), t("free_feat_3"), t("free_feat_4")].map((f) => (
                <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 text-[var(--pe-success)] mt-0.5" /> {f}</li>
              ))}
            </ul>
            <Link to="/register" data-testid="pricing-free-cta" className="pe-btn-outline w-full inline-block text-center py-3">
              {t("cta_start")}
            </Link>
          </div>
          <div className="pe-card p-8 border-2 border-[var(--pe-accent)] relative">
            <span className="pe-chip absolute -top-3 left-6" style={{ background: "var(--pe-accent)", color: "#FDFCF8" }}>
              <Crown className="h-3 w-3" /> {lang === "pt" ? "Mais popular" : "Most popular"}
            </span>
            <div className="font-display text-2xl font-black mb-1">{t("premium_plan")}</div>
            <div className="text-sm text-[var(--pe-muted)] mb-6">R$ 19,90 / {lang === "pt" ? "mês" : "month"}</div>
            <ul className="space-y-3 text-sm mb-8">
              {[t("premium_feat_1"), t("premium_feat_2"), t("premium_feat_3"), t("premium_feat_4")].map((f) => (
                <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 text-[var(--pe-accent)] mt-0.5" /> {f}</li>
              ))}
            </ul>
            <Link to="/register" data-testid="pricing-premium-cta" className="pe-btn-accent w-full inline-block text-center py-3">
              {t("go_premium")}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--pe-border)] mt-10">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between text-xs text-[var(--pe-muted)]">
          <div>{t("copy_right")}</div>
          <div>{lang === "pt" ? "Feito com ♥ para quem quer economizar" : "Made with ♥ for savers"}</div>
        </div>
      </footer>
    </div>
  );
}
