"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ekidos-taxi-production-587e.up.railway.app";

interface ClientInfo {
  name?: string;
  email?: string;
  phone?: string;
  id?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("client-token");
    if (!token) { router.replace("/login"); return; }
    try {
      const raw = localStorage.getItem("clientInfo");
      if (raw) {
        const info = JSON.parse(raw);
        setClientInfo(info);
        setName(info.name || "");
      }
    } catch {}
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("client-token");
    try {
      const res = await fetch(`${API_URL}/api/clients/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = { ...clientInfo, name, ...(data.client || {}) };
        setClientInfo(updated);
        localStorage.setItem("clientInfo", JSON.stringify(updated));
      } else {
        // Update locally anyway
        const updated = { ...clientInfo, name };
        setClientInfo(updated);
        localStorage.setItem("clientInfo", JSON.stringify(updated));
      }
    } catch {
      const updated = { ...clientInfo, name };
      setClientInfo(updated);
      localStorage.setItem("clientInfo", JSON.stringify(updated));
    } finally {
      setSaving(false);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const initial = clientInfo?.name?.[0]?.toUpperCase() || clientInfo?.email?.[0]?.toUpperCase() || "U";

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      {/* Header */}
      <div style={{
        padding: "16px",
        display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid #1a1a1a",
        background: "#111",
      }}>
        <button
          onClick={() => router.push("/")}
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: "#1a1a1a", border: "1px solid #2a2a2a",
            color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Профиль</h1>
      </div>

      {/* Avatar section */}
      <div style={{ padding: "32px 20px 24px", display: "flex", flexDirection: "column", alignItems: "center", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "linear-gradient(135deg, #ef4444, #b91c1c)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, fontWeight: 700, color: "#fff",
          marginBottom: 16,
          boxShadow: "0 8px 24px rgba(239,68,68,0.3)",
        }}>
          {initial}
        </div>

        {editing ? (
          <div style={{ width: "100%", maxWidth: 300 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              placeholder="Введите имя"
              style={{
                width: "100%", padding: "12px 14px",
                background: "#1a1a1a", border: "1px solid #333",
                borderRadius: 12, color: "#fff", fontSize: 16, textAlign: "center",
                outline: "none", marginBottom: 10,
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1, padding: "11px",
                  background: saving ? "#2a2a2a" : "linear-gradient(135deg, #ef4444, #b91c1c)",
                  border: "none", borderRadius: 10,
                  color: "#fff", fontSize: 14, fontWeight: 700,
                }}
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                onClick={() => { setEditing(false); setName(clientInfo?.name || ""); }}
                style={{
                  flex: 1, padding: "11px",
                  background: "#1a1a1a", border: "1px solid #2a2a2a",
                  borderRadius: 10, color: "#888", fontSize: 14,
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
              {clientInfo?.name || "Без имени"}
            </div>
            <div style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>
              {clientInfo?.email || clientInfo?.phone || ""}
            </div>
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: "9px 20px",
                background: "#1a1a1a", border: "1px solid #2a2a2a",
                borderRadius: 10, color: "#ccc", fontSize: 14, fontWeight: 600,
              }}
            >
              ✏️ Редактировать
            </button>
            {saved && (
              <div style={{ marginTop: 10, color: "#4ade80", fontSize: 13, fontWeight: 600 }}>
                ✓ Сохранено
              </div>
            )}
          </>
        )}
      </div>

      {/* Info fields */}
      <div style={{ padding: "20px 16px" }}>
        <div style={{ fontSize: 12, color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
          Данные аккаунта
        </div>

        {[
          { label: "Email", value: clientInfo?.email || "—" },
          { label: "Телефон", value: clientInfo?.phone || "—" },
        ].map((field) => (
          <div
            key={field.label}
            style={{
              background: "#111", border: "1px solid #1a1a1a",
              borderRadius: 12, padding: "14px 16px", marginBottom: 10,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <div style={{ fontSize: 13, color: "#888" }}>{field.label}</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{field.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
