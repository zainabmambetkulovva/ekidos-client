"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "./i18n";

// ============================================================================
// EKIDOS CLIENT — Main Entry
// Flow: Welcome Splash -> Home (big red button) -> /order (map page)
// ============================================================================

export default function HomePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"splash" | "home">("splash");
  const [fadeIn, setFadeIn] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem("client-token");
    if (!token) { router.replace("/login"); return; }

    // Splash animation
    setTimeout(() => setFadeIn(true), 100);
    setTimeout(() => setPhase("home"), 2000);
    setTimeout(() => setBtnVisible(true), 2400);
  }, [router]);

  // ── WELCOME SPLASH ──
  if (phase === "splash") {
    return (
      <div style={{
        height: "100vh", width: "100vw",
        background: "#ffffff",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "scale(1) translateY(0)" : "scale(0.8) translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}>
          <div style={{
            fontSize: 48, fontWeight: 900, letterSpacing: -2,
            color: "#ef4444", textAlign: "center",
          }}>
            EKIDOS
          </div>
          <div style={{
            fontSize: 14, color: "#999", textAlign: "center",
            marginTop: 8, letterSpacing: 4, textTransform: "uppercase",
          }}>
            taxi
          </div>
        </div>

        {/* Decorative dots */}
        <div style={{
          display: "flex", gap: 6, marginTop: 40,
          opacity: fadeIn ? 1 : 0,
          transition: "opacity 1s ease 0.5s",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite 0.3s" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite 0.6s" }} />
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    );
  }

  // ── HOME SCREEN — clean, white, one big button ──
  return (
    <div style={{
      height: "100vh", width: "100vw",
      background: "linear-gradient(180deg, #ffffff 0%, #f8f8f8 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 32,
      overflow: "hidden",
    }}>
      {/* Top logo */}
      <div style={{
        position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)",
        opacity: btnVisible ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#ef4444", letterSpacing: -0.5 }}>
          EKIDOS
        </div>
      </div>

      {/* Center content */}
      <div style={{
        opacity: btnVisible ? 1 : 0,
        transform: btnVisible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 24,
      }}>
        {/* Taxi icon */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(239,68,68,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36,
        }}>
          {"\u{1F696}"}
        </div>

        {/* Main heading */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 28, fontWeight: 800, color: "#1a1a1a",
            lineHeight: 1.2,
          }}>
            {t("orderTaxi").replace(/\u{1F696}\s*/u, "")}
          </div>
          <div style={{
            fontSize: 14, color: "#888", marginTop: 8,
          }}>
            {t("subtitle")}
          </div>
        </div>

        {/* Big red button */}
        <button
          onClick={() => router.push("/order")}
          style={{
            width: "100%", maxWidth: 320,
            padding: "20px 32px",
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            border: "none",
            borderRadius: 20,
            color: "#fff",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 0.3,
            boxShadow: "0 12px 40px rgba(239,68,68,0.35), 0 4px 12px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseDown={e => { e.currentTarget.style.transform = "scale(0.96)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          onTouchStart={e => { e.currentTarget.style.transform = "scale(0.96)"; }}
          onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {t("orderTaxi")}
        </button>
      </div>

      {/* Bottom subtle branding */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
        opacity: btnVisible ? 1 : 0,
        transition: "opacity 0.6s ease 0.3s",
        fontSize: 12, color: "#ccc",
      }}>
        Toktogul, Kyrgyzstan
      </div>
    </div>
  );
}
