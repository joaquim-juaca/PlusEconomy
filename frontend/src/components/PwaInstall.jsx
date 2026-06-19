import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useI18n } from "../contexts/I18nContext";

export default function PwaInstall() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const { lang } = useI18n();

  useEffect(() => {
    const dismissed = localStorage.getItem("pe_pwa_dismissed");
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      if (!dismissed) setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !prompt) return null;

  const install = async () => {
    prompt.prompt();
    try {
      await prompt.userChoice;
    } catch {}
    setVisible(false);
    setPrompt(null);
  };

  const dismiss = () => {
    localStorage.setItem("pe_pwa_dismissed", "1");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-80 z-40 pe-card p-4 shadow-2xl" data-testid="pwa-install-banner">
      <button onClick={dismiss} data-testid="pwa-dismiss" className="absolute top-2 right-2 p-1 rounded-full hover:bg-[var(--pe-border)]/50">
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-[var(--pe-primary)] text-[#FDFCF8] grid place-items-center shrink-0">
          <Download className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="font-display font-bold text-sm mb-0.5">
            {lang === "pt" ? "Instalar PlusEconomy" : "Install PlusEconomy"}
          </div>
          <div className="text-xs text-[var(--pe-muted)] mb-3">
            {lang === "pt"
              ? "Adicione à tela inicial para uso rápido e offline."
              : "Add to home screen for fast, offline access."}
          </div>
          <button onClick={install} data-testid="pwa-install-btn" className="pe-btn-primary px-4 py-1.5 text-xs">
            {lang === "pt" ? "Instalar" : "Install"}
          </button>
        </div>
      </div>
    </div>
  );
}
