"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ekidos-taxi-production-587e.up.railway.app";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("client-token");
    if (token) router.replace("/");
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Введите email"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/client/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setStep("code");
        setCountdown(60);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Ошибка отправки кода. Попробуйте снова.");
      }
    } catch {
      setError("Нет соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setError("Введите код"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/client/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("client-token", data.token || data.accessToken || "");
        if (data.client || data.user) {
          localStorage.setItem("clientInfo", JSON.stringify(data.client || data.user));
        }
        router.replace("/");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Неверный код. Попробуйте снова.");
      }
    } catch {
      setError("Нет соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: "linear-gradient(135deg, #ef4444, #b91c1c)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(239,68,68,0.4)",
          }}>
            🚖
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
            <span style={{ color: "#ef4444" }}>Ekidos</span>
          </div>
          <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>Такси Токтогул</div>
        </div>

        {/* Card */}
        <div style={{
          background: "#111", borderRadius: 20,
          border: "1px solid #1a1a1a",
          padding: "28px 24px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
              {step === "email" ? "Войти" : "Подтвердите код"}
            </div>
            <div style={{ fontSize: 14, color: "#888" }}>
              {step === "email"
                ? "Введите ваш email для входа"
                : `Код отправлен на ${email}`}
            </div>
          </div>

          {step === "email" ? (
            <form onSubmit={handleRequestOTP}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="your@email.com"
                  autoComplete="email"
                  style={{
                    width: "100%", padding: "13px 14px",
                    background: "#1a1a1a",
                    border: error ? "1px solid #ef4444" : "1px solid #2a2a2a",
                    borderRadius: 12, color: "#fff", fontSize: 15, outline: "none",
                  }}
                />
              </div>

              {error && (
                <div style={{ marginBottom: 14, padding: "10px 12px", background: "#1a0000", border: "1px solid #7f1d1d", borderRadius: 10, color: "#fca5a5", fontSize: 13 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "14px",
                  background: loading ? "#2a2a2a" : "linear-gradient(135deg, #ef4444, #b91c1c)",
                  border: "none", borderRadius: 12,
                  color: loading ? "#666" : "#fff",
                  fontSize: 15, fontWeight: 700,
                  boxShadow: loading ? "none" : "0 4px 16px rgba(239,68,68,0.4)",
                }}
              >
                {loading ? "Отправка..." : "Получить код →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Код подтверждения
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={6}
                  style={{
                    width: "100%", padding: "13px 14px",
                    background: "#1a1a1a",
                    border: error ? "1px solid #ef4444" : "1px solid #2a2a2a",
                    borderRadius: 12, color: "#fff", fontSize: 24, fontWeight: 700,
                    letterSpacing: 8, textAlign: "center", outline: "none",
                  }}
                  autoFocus
                />
              </div>

              {error && (
                <div style={{ marginBottom: 14, padding: "10px 12px", background: "#1a0000", border: "1px solid #7f1d1d", borderRadius: 10, color: "#fca5a5", fontSize: 13 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length < 4}
                style={{
                  width: "100%", padding: "14px",
                  background: (loading || code.length < 4) ? "#2a2a2a" : "linear-gradient(135deg, #ef4444, #b91c1c)",
                  border: "none", borderRadius: 12,
                  color: (loading || code.length < 4) ? "#666" : "#fff",
                  fontSize: 15, fontWeight: 700,
                  marginBottom: 12,
                  boxShadow: (loading || code.length < 4) ? "none" : "0 4px 16px rgba(239,68,68,0.4)",
                }}
              >
                {loading ? "Проверка..." : "Войти →"}
              </button>

              <div style={{ textAlign: "center" }}>
                {countdown > 0 ? (
                  <span style={{ fontSize: 13, color: "#666" }}>Повторный код через {countdown}с</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setStep("email"); setCode(""); setError(""); }}
                    style={{ background: "none", border: "none", color: "#ef4444", fontSize: 13, fontWeight: 600 }}
                  >
                    Отправить снова
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Back link */}
        {step === "code" && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              onClick={() => { setStep("email"); setCode(""); setError(""); }}
              style={{ background: "none", border: "none", color: "#888", fontSize: 14 }}
            >
              ← Изменить email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
