"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "./i18n";

export default function HomePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"splash" | "home">("splash");
  const [step, setStep] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("client-token");
    if (!token || token === 'guest') { router.replace("/login"); return; }

    // Smooth animation sequence
    setTimeout(() => setStep(1), 200);   // icon appears
    setTimeout(() => setStep(2), 800);   // text appears
    setTimeout(() => setStep(3), 2200);  // transition to home
    setTimeout(() => setPhase("home"), 2600);
    setTimeout(() => setStep(4), 2900);  // home content appears
  }, [router]);

  // SPLASH
  if (phase === "splash") {
    return (
      <div style={{
        height: "100vh", width: "100vw",
        background: "#ffffff",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 24,
        transition: "opacity 0.5s ease",
        opacity: step >= 3 ? 0 : 1,
      }}>
        {/* Taxi icon */}
        <div style={{
          width: 120, height: 120, borderRadius: "50%",
          background: "#fef1f1",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 56,
          opacity: step >= 1 ? 1 : 0,
          transform: step >= 1 ? "scale(1) translateY(0)" : "scale(0.5) translateY(20px)",
          transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}>
          {"\u{1F696}"}
        </div>

        {/* Welcome text */}
        <div style={{
          opacity: step >= 2 ? 1 : 0,
          transform: step >= 2 ? "translateY(0)" : "translateY(15px)",
          transition: "all 0.6s ease 0.1s",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#ef4444", letterSpacing: -1 }}>
            EKIDOS
          </div>
          <div style={{
            fontSize: 16, color: "#888", marginTop: 8,
            letterSpacing: 2, fontWeight: 500,
          }}>
            Welcome
          </div>
        </div>

        {/* Subtle dots */}
        <div style={{
          display: "flex", gap: 6, marginTop: 20,
          opacity: step >= 2 ? 0.6 : 0,
          transition: "opacity 0.8s ease 0.3s",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.4s infinite" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.4s infinite 0.2s" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.4s infinite 0.4s" }} />
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
      </div>
    );
  }

  // HOME
  return (
    <div style={{
      height: "100vh", width: "100vw",
      background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 32,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Burger Menu */}
      <div style={{
        position: "absolute", top: 48, right: 24, zIndex: 100,
      }}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: "#fff", border: "1px solid #e5e5e5",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 5, boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            cursor: "pointer",
          }}
        >
          <div style={{
            width: 20, height: 2, background: "#333", borderRadius: 2,
          }} />
          <div style={{
            width: 20, height: 2, background: "#333", borderRadius: 2,
          }} />
          <div style={{
            width: 20, height: 2, background: "#333", borderRadius: 2,
          }} />
        </button>

        {/* Menu Dropdown */}
        {menuOpen && (
          <>
            <div
              style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
                zIndex: 99,
              }}
              onClick={() => setMenuOpen(false)}
            />
            <div style={{
              position: "absolute", top: "100%", right: 0,
              marginTop: 8, background: "#fff", borderRadius: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              overflow: "hidden", minWidth: 180,
            }}>
              <button
                onClick={() => { setMenuOpen(false); router.push("/profile"); }}
                style={{
                  width: "100%", padding: "14px 18px",
                  background: "none", border: "none",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#333",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 18 }}>👤</span>
                Профиль
              </button>
              <button
                onClick={() => { setMenuOpen(false); router.push("/settings"); }}
                style={{
                  width: "100%", padding: "14px 18px",
                  background: "none", border: "none",
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#333",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 18 }}>⚙️</span>
                Настройки
              </button>
            </div>
          </>
        )}
      </div>

      {/* EKIDOS top */}
      <div style={{
        position: "absolute", top: 48, left: "50%", transform: "translateX(-50%)",
        opacity: step >= 4 ? 1 : 0,
        transition: "all 0.6s ease",
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#ef4444", letterSpacing: -0.5 }}>
          EKIDOS
        </div>
      </div>

      {/* Center */}
      <div style={{
        opacity: step >= 4 ? 1 : 0,
        transform: step >= 4 ? "translateY(0)" : "translateY(40px)",
        transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 28,
      }}>
        {/* Taxi icon - same as splash */}
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: "#fef1f1",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 48,
        }}>
          {"\u{1F696}"}
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3 }}>
            {t("orderTaxi").replace(/\u{1F696}\s*/u, "")}
          </div>
          <div style={{ fontSize: 14, color: "#999", marginTop: 8 }}>
            {t("subtitle")}
          </div>
        </div>

        {/* Big red button */}
        <button
          onClick={() => router.push("/order")}
          style={{
            width: "100%", maxWidth: 300,
            padding: "18px 32px",
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            border: "none",
            borderRadius: 18,
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 10px 36px rgba(239,68,68,0.3), 0 4px 12px rgba(0,0,0,0.08)",
            cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseDown={e => { e.currentTarget.style.transform = "scale(0.96)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          onTouchStart={e => { e.currentTarget.style.transform = "scale(0.96)"; }}
          onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <span style={{ fontSize: 22 }}>{"\u{1F696}"}</span>
          {t("orderTaxi").replace(/\u{1F696}\s*/u, "")}
        </button>
      </div>

      {/* Bottom */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
        opacity: step >= 4 ? 1 : 0,
        transition: "opacity 0.8s ease 0.5s",
        fontSize: 12, color: "#ccc",
      }}>
        Toktogul, Kyrgyzstan
      </div>
    </div>
  );
}
