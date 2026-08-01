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
        width: 50, height: 28,
        borderRadius: 14,
        background: value ? "#ef4444" : "#2a2a2a",
        border: "none", position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
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
    darkMode: true,
    language: "ru",
  });
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

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
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (!mounted) return null;

  const bg = settings.darkMode ? "#0a0a0a" : "#f5f5f5";
  const cardBg = settings.darkMode ? "#111" : "#fff";
  const borderColor = settings.darkMode ? "#1a1a1a" : "#e5e5e5";
  const textColor = settings.darkMode ? "#fff" : "#111";
  const subTextColor = settings.darkMode ? "#888" : "#666";

  return (
    <div style={{ minHeight: "100vh", background: bg, color: textColor }}>
      {/* Header */}
      <div style={{
        padding: "16px",
        display: "flex", alignItems: "center", gap: 12,
        borderBottom: `1px solid ${borderColor}`,
        background: cardBg,
      }}>
        <button
          onClick={() => router.push("/")}
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: settings.darkMode ? "#1a1a1a" : "#f0f0f0",
            border: `1px solid ${borderColor}`,
            color: textColor, fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Настройки</h1>
        {saved && (
          <div style={{ marginLeft: "auto", color: "#4ade80", fontSize: 13, fontWeight: 600 }}>✓ Сохранено</div>
        )}
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* Notifications */}
        <div style={{ fontSize: 12, color: subTextColor, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
          Уведомления
        </div>
        <div style={{
          background: cardBg, border: `1px solid ${borderColor}`,
          borderRadius: 14, marginBottom: 20, overflow: "hidden",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px",
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Push-уведомления</div>
              <div style={{ fontSize: 13, color: subTextColor, marginTop: 2 }}>
                Уведомления о заказах и акциях
              </div>
            </div>
            <Toggle value={settings.notifications} onChange={v => updateSetting("notifications", v)} />
          </div>
        </div>

        {/* Appearance */}
        <div style={{ fontSize: 12, color: subTextColor, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
          Внешний вид
        </div>
        <div style={{
          background: cardBg, border: `1px solid ${borderColor}`,
          borderRadius: 14, marginBottom: 20, overflow: "hidden",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px",
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>
                {settings.darkMode ? "🌙 Тёмная тема" : "☀️ Светлая тема"}
              </div>
              <div style={{ fontSize: 13, color: subTextColor, marginTop: 2 }}>
                {settings.darkMode ? "Тёмный режим включён" : "Светлый режим включён"}
              </div>
            </div>
            <Toggle value={settings.darkMode} onChange={v => updateSetting("darkMode", v)} />
          </div>
        </div>

        {/* Language */}
        <div style={{ fontSize: 12, color: subTextColor, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
          Язык
        </div>
        <div style={{
          background: cardBg, border: `1px solid ${borderColor}`,
          borderRadius: 14, marginBottom: 20, overflow: "hidden",
        }}>
          {LANGUAGES.map((lang, idx) => (
            <button
              key={lang.code}
              onClick={() => updateSetting("language", lang.code)}
              style={{
                width: "100%", padding: "15px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: settings.language === lang.code
                  ? (settings.darkMode ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.07)")
                  : "none",
                border: "none",
                borderBottom: idx < LANGUAGES.length - 1 ? `1px solid ${borderColor}` : "none",
                color: textColor,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: settings.darkMode ? "#1a1a1a" : "#f0f0f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: subTextColor,
                }}>
                  {lang.native}
                </div>
                <span style={{ fontSize: 15, fontWeight: settings.language === lang.code ? 600 : 400 }}>
                  {lang.label}
                </span>
              </div>
              {settings.language === lang.code && (
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff" }}>
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>

        {/* About */}
        <div style={{ fontSize: 12, color: subTextColor, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
          О приложении
        </div>
        <div style={{
          background: cardBg, border: `1px solid ${borderColor}`,
          borderRadius: 14, overflow: "hidden",
        }}>
          {[
            { label: "Версия приложения", value: "1.0.0" },
            { label: "Город", value: "Токтогул, Кыргызстан" },
          ].map((item, idx, arr) => (
            <div
              key={item.label}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 16px",
                borderBottom: idx < arr.length - 1 ? `1px solid ${borderColor}` : "none",
              }}
            >
              <span style={{ fontSize: 14, color: subTextColor }}>{item.label}</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
