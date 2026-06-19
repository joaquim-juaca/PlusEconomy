import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./contexts/AuthContext";
import { I18nProvider } from "./contexts/I18nContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import AuthCallback from "./components/AuthCallback";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Cards from "./pages/Cards";
import Limits from "./pages/Limits";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
import AiAssistant from "./pages/AiAssistant";
import Investments from "./pages/Investments";
import Upgrade from "./pages/Upgrade";
import SettingsPage from "./pages/Settings";
import PwaInstall from "./components/PwaInstall";

// Register service worker once
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

function AppRouter() {
  const location = useLocation();
  // Check URL fragment (not query params) for session_id — synchronously during render
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Layout><Transactions /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cards"
        element={
          <ProtectedRoute>
            <Layout><Cards /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/limits"
        element={
          <ProtectedRoute>
            <Layout><Limits /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <Layout><Goals /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout><Reports /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai"
        element={
          <ProtectedRoute>
            <Layout><AiAssistant /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/investments"
        element={
          <ProtectedRoute>
            <Layout><Investments /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upgrade"
        element={
          <ProtectedRoute>
            <Layout><Upgrade /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout><SettingsPage /></Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <I18nProvider>
          <BrowserRouter>
            <AuthProvider>
              <AppRouter />
              <PwaInstall />
              <Toaster position="top-center" richColors closeButton />
            </AuthProvider>
          </BrowserRouter>
        </I18nProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
