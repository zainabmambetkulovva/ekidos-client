"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Language = "ru" | "ky" | "en";

interface Settings {
  notifications: boolean;
  darkMode: boolean;
  language: Language;
}

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: "ru", label: "Русский", native: "RU" },
  { code: "ky", label: "Кыргызча", native: "КЫ" },
  { code: "en", label: "English", native: "EN" },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 50, height: 28, borderRadius: 14,
        background: value ? "#ef4444" : "#d1d5db",
        border: "none", position: "relative",
        transition: "background 0.2s", flexShrink: 0, cursor: "pointer",
      }}
      role="switch"
      aria-checked={value}
    >
      <div style={{
        position: "absolute", top: 3,
        left: value ? 25 : 3,
        width: 22, height: 22, borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    darkMode: false,
    language: "ru",
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("client-token");
    if (!token) { router.replace("/login"); return; }
    try {
      const raw = localStorage.getItem("ekidos-settings");
      if (raw) setSettings(JSON.parse(raw));
    } catch {}
  }, [router]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem("ekidos-settings", JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem("client-token");
    localStorage.removeItem("clientInfo");
    router.replace("/login");
  };

  if (!mounted) return null;

  const bg = settings.darkMode ? "#0a0a0a" : "#f5f5f5";
  const cardBg = settings.darkMode ? "#111" : "#fff";
  const border = settings.darkMode ? "#1e1e1e" : "#e5e5e5";
  const text = settings.darkMode ? "#fff" : "#111";
  const sub = settings.darkMode ? "#888" : "#666";

  // Get client info for profile preview
  let clientInfo: { name?: string; email?: string; phone?: string } = {};
  try {
    const raw = localStorage.getItem("clientInfo");
    if (raw) clientInfo = JSON.parse(raw);
  } catch {}
  const initial = clientInfo?.name?.[0]?.toUpperCase() || clientInfo?.email?.[0]?.toUpperCase() || "U";

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text }}>
      {/* Header */}
      <div style={{
        padding: "16px",
        display: "flex", alignItems: "center", gap: 12,
        borderBottom: `1px solid ${border}`,
        background: cardBg,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: settings.darkMode ? "#1a1a1a" : "#f0f0f0",
            border: `1px solid ${border}`,
            color: text, fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Настройки</h1>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>

        {/* ── PROFILE section ── */}
        <div style={{ fontSize: 11, color: sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          Профиль
        </div>
        <div style={{
          background: cardBg, border: `1px solid ${border}`,
          borderRadius: 16, marginBottom: 24, overflow: "hidden",
        }}>
          <button
            onClick={() => router.push("/profile")}
            style={{
              width: "100%", padding: "16px",
              background: "none", border: "none",
              display: "flex", alignItems: "center", gap: 14,
              cursor: "pointer", textAlign: "left",
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "linear-gradient(135deg, #ef4444, #b91c1c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {initial}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: text }}>
                {clientInfo?.name || "Профиль"}
              </div>
              <div style={{ fontSize: 13, color: sub, marginTop: 2 }}>
                {clientInfo?.email || clientInfo?.phone || "Маалымат көрүү"}
              </div>
            </div>
            <div style={{ color: sub, fontSize: 18 }}>›</div>
          </button>
        </div>

        {/* ── NOTIFICATIONS ── */}
        <div style={{ fontSize: 11, color: sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          Уведомления
        </div>
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: text }}>Push-уведомления</div>
              <div style={{ fontSize: 13, color: sub, marginTop: 2 }}>Заказдар жана акциялар</div>
            </div>
            <Toggle value={settings.notifications} onChange={v => updateSetting("notifications", v)} />
          </div>
        </div>

        {/* ── APPEARANCE ── */}
        <div style={{ fontSize: 11, color: sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          Сырткы көрүнүш
        </div>
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: text }}>
                {settings.darkMode ? "🌙 Тёмная тема" : "☀️ Светлая тема"}
              </div>
              <div style={{ fontSize: 13, color: sub, marginTop: 2 }}>
                {settings.darkMode ? "Тёмный режим" : "Светлый режим"}
              </div>
            </div>
            <Toggle value={settings.darkMode} onChange={v => updateSetting("darkMode", v)} />
          </div>
        </div>

        {/* ── LANGUAGE ── */}
        <div style={{ fontSize: 11, color: sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          Тил / Язык
        </div>
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, marginBottom: 24, overflow: "hidden" }}>
          {LANGUAGES.map((lang, idx) => (
            <button
              key={lang.code}
              onClick={() => updateSetting("language", lang.code)}
              style={{
                width: "100%", padding: "15px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: settings.language === lang.code
                  ? (settings.darkMode ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.07)")
                  : "none",
                border: "none",
                borderBottom: idx < LANGUAGES.length - 1 ? `1px solid ${border}` : "none",
                color: text, cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: settings.darkMode ? "#1a1a1a" : "#f0f0f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: sub,
                }}>
                  {lang.native}
                </div>
                <span style={{ fontSize: 15, fontWeight: settings.language === lang.code ? 700 : 400 }}>
                  {lang.label}
                </span>
              </div>
              {settings.language === lang.code && (
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "#ef4444",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "#fff",
                }}>✓</div>
              )}
            </button>
          ))}
        </div>

        {/* ── ABOUT ── */}
        <div style={{ fontSize: 11, color: sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          Тиркеме жөнүндө
        </div>
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, marginBottom: 24, overflow: "hidden" }}>
          {[
            { label: "Версия", value: "1.0.0" },
            { label: "Шаар", value: "Токтогул, Кыргызстан" },
          ].map((item, idx, arr) => (
            <div key={item.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 16px",
              borderBottom: idx < arr.length - 1 ? `1px solid ${border}` : "none",
            }}>
              <span style={{ fontSize: 14, color: sub }}>{item.label}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: text }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* ── LOGOUT ── */}
        <button
          onClick={handleLogout}
          style={{
            width: "100%", padding: "16px",
            background: settings.darkMode ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.07)",
            border: `1px solid rgba(239,68,68,0.3)`,
            borderRadius: 16, color: "#ef4444",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          🚪 Чыгуу
        </button>
      </div>
    </div>
  );
}
