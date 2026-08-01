"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ekidos-taxi-production-587e.up.railway.app";

// ---- Side Drawer ----
function SideDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [clientInfo, setClientInfo] = useState<{ name?: string; email?: string; phone?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("clientInfo");
      if (raw) setClientInfo(JSON.parse(raw));
    } catch {}
  }, [open]);

  const initial = clientInfo?.name?.[0]?.toUpperCase() || clientInfo?.email?.[0]?.toUpperCase() || "U";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          display: open ? "block" : "none",
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 300,
          backdropFilter: "blur(2px)",
        }}
      />
      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 280,
          background: "#111",
          zIndex: 301,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 24px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "linear-gradient(135deg, #ef4444, #b91c1c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 700, color: "#fff",
              flexShrink: 0,
            }}>
              {initial}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#fff" }}>
                {clientInfo?.name || "Ð“Ð¾ÑÑ‚ÑŒ"}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                {clientInfo?.email || clientInfo?.phone || ""}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#888", fontSize: 22, padding: 4, lineHeight: 1 }}
          >
            âœ•
          </button>
        </div>

        {/* Logo strip */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
            <span style={{ color: "#ef4444" }}>Ekidos</span>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 400, marginLeft: 8 }}>Ð¢Ð¾ÐºÑ‚Ð¾Ð³ÑƒÐ»</span>
          </div>
        </div>

        {/* Menu items */}
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {[
            { icon: "ðŸ‘¤", label: "ÐŸÑ€Ð¾Ñ„Ð¸Ð»ÑŒ", path: "/profile" },
            { icon: "âš™ï¸", label: "ÐÐ°ÑÑ‚Ñ€Ð¾Ð¹ÐºÐ¸", path: "/settings" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => { onClose(); router.push(item.path); }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                width: "100%", padding: "14px 20px",
                background: "none", border: "none", color: "#e5e5e5",
                fontSize: 15, textAlign: "left",
                borderRadius: 0,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1a1a1a")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ fontSize: 20, width: 24, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1a1a1a" }}>
          <button
            onClick={() => {
              localStorage.removeItem("client-token");
              localStorage.removeItem("clientInfo");
              router.push("/login");
            }}
            style={{
              width: "100%", padding: "12px 16px",
              background: "#1a1a1a", border: "1px solid #333",
              borderRadius: 10, color: "#ef4444",
              fontSize: 14, fontWeight: 600,
            }}
          >
            Ð’Ñ‹Ð¹Ñ‚Ð¸
          </button>
        </div>
      </div>
    </>
  );
}

// ---- Map component (client only) ----
function HomeMap({ onReady }: { onReady: (mapRef: React.MutableRefObject<unknown>) => void }) {
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const userMarkerRef = useRef<unknown>(null);
  const driverMarkersRef = useRef<Map<string, unknown>>(new Map());

  useEffect(() => {
    if (typeof window === "undefined" || mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");

    const map = L.map(mapElRef.current!, {
      center: [41.8747, 72.9422],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    onReady(mapRef);

    // Geolocation
    navigator.geolocation?.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      map.setView([latitude, longitude], 15);

      const userIcon = L.divIcon({
        className: "",
        html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      if (userMarkerRef.current) {
        (userMarkerRef.current as { setLatLng: (latlng: [number,number]) => void }).setLatLng([latitude, longitude]);
      } else {
        userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
      }
    });

    // Driver polling
    const fetchDrivers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/available`);
        if (!res.ok) return;
        const data = await res.json();
        const drivers: Array<{ id: string; lat: number; lng: number; name?: string }> = Array.isArray(data) ? data : data.drivers || [];

        const seen = new Set<string>();
        drivers.forEach((d) => {
          seen.add(d.id);
          const taxiIcon = L.divIcon({
            className: "",
            html: `<div style="font-size:22px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">ðŸš–</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          if (driverMarkersRef.current.has(d.id)) {
            (driverMarkersRef.current.get(d.id) as { setLatLng: (latlng: [number,number]) => void })?.setLatLng([d.lat, d.lng]);
          } else {
            const m = L.marker([d.lat, d.lng], { icon: taxiIcon }).addTo(map);
            driverMarkersRef.current.set(d.id, m);
          }
        });

        // Remove gone drivers
        driverMarkersRef.current.forEach((m, id) => {
          if (!seen.has(id)) {
            (m as { remove: () => void }).remove();
            driverMarkersRef.current.delete(id);
          }
        });
      } catch {}
    };

    fetchDrivers();
    const interval = setInterval(fetchDrivers, 15000);

    return () => {
      clearInterval(interval);
      map.remove();
      mapRef.current = null;
    };
  }, [onReady]);

  return (
    <div
      ref={mapElRef}
      style={{ width: "100%", height: "100%", background: "#1a1a2e", zIndex: 1, position: "relative" }}
    />
  );
}

// ---- Main Home Page ----
export default function HomePage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mapRefHolder = useRef<unknown>(null);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("client-token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleMapReady = useCallback((ref: React.MutableRefObject<unknown>) => {
    mapRefHolder.current = ref;
  }, []);

  if (!mounted) {
    return (
      <div style={{ height: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#ef4444", fontSize: 28, fontWeight: 800 }}>Ekidos</div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw", overflow: "hidden", background: "#0a0a0a" }}>
      {/* Map */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <HomeMap onReady={handleMapReady} />
      </div>

      {/* Top gradient */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 100,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 10,
      }} />

      {/* Bottom gradient */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 200,
        background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 10,
      }} />

      {/* Burger menu button */}
      <button
        onClick={() => setDrawerOpen(true)}
        style={{
          position: "absolute", top: 16, left: 16, zIndex: 100,
          width: 44, height: 44,
          background: "rgba(17,17,17,0.92)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, color: "#fff",
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
        }}
        aria-label="ÐžÑ‚ÐºÑ€Ñ‹Ñ‚ÑŒ Ð¼ÐµÐ½ÑŽ"
      >
        â˜°
      </button>

      {/* App title */}
      <div style={{
        position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
        zIndex: 20, pointerEvents: "none",
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5, textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
          <span style={{ color: "#ef4444" }}>Ekidos</span>
        </div>
      </div>

      {/* Order button */}
      <div style={{
        position: "absolute", bottom: 40, left: "50%", zIndex: 100,, transform: "translateX(-50%)",
        zIndex: 20, width: "calc(100% - 32px)", maxWidth: 380,
      }}>
        <button
          onClick={() => router.push("/order")}
          style={{
            width: "100%",
            padding: "18px 0",
            background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
            border: "none",
            borderRadius: 16,
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 0.5,
            boxShadow: "0 8px 32px rgba(239,68,68,0.5), 0 2px 8px rgba(0,0,0,0.3)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = "scale(0.97)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(239,68,68,0.4)";
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(239,68,68,0.5), 0 2px 8px rgba(0,0,0,0.3)";
          }}
          onTouchStart={e => {
            e.currentTarget.style.transform = "scale(0.97)";
          }}
          onTouchEnd={e => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ðŸš– Ð—Ð°ÐºÐ°Ð·Ð°Ñ‚ÑŒ Ñ‚Ð°ÐºÑÐ¸
        </button>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          Ð¢Ð¾ÐºÑ‚Ð¾Ð³ÑƒÐ» â€” Ð±Ñ‹ÑÑ‚Ñ€Ð¾ Ð¸ Ð½Ð°Ð´Ñ‘Ð¶Ð½Ð¾
        </div>
      </div>

      {/* Side drawer */}
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}


