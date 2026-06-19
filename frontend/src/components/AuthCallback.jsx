import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    (async () => {
      const hash = window.location.hash || "";
      const m = hash.match(/session_id=([^&]+)/);
      if (!m) {
        navigate("/login");
        return;
      }
      const session_id = decodeURIComponent(m[1]);
      try {
        const r = await api.post("/auth/emergent-session", { session_id });
        setUser(r.data.user);
        // Emergent returns session_token — backend sets cookie; we also save bearer fallback
        if (r.data.session_token) localStorage.setItem("pe_token", r.data.session_token);
        // Clean hash
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate("/dashboard", { state: { user: r.data.user } });
      } catch (e) {
        navigate("/login");
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen grid place-items-center bg-[var(--pe-bg)] text-[var(--pe-text)]">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--pe-primary)] border-t-transparent animate-spin" />
        <span className="font-medium">...</span>
      </div>
    </div>
  );
}
