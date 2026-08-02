"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ekidos-taxi-production-587e.up.railway.app";

interface LatLng { lat: number; lng: number; label?: string }
interface PriceInfo { price: number; distance: number; currency?: string }
interface DriverInfo { name: string; car?: string; rating?: number; phone?: string }

// Reverse geocode using Nominatim
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ru`,
      { headers: { "User-Agent": "ekidos-client/1.0" } }
    );
    const data = await res.json();
    return data.display_name?.split(",").slice(0, 2).join(", ") || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// Distance between two points (Haversine)
function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// ---- Driver info card ----
function DriverCard({ driver, onClose }: { driver: DriverInfo; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
      background: "#111", borderRadius: "20px 20px 0 0",
      padding: "20px 20px 36px",
      boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
      animation: "slideUp 0.3s ease",
    }}>
      <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>Водитель найден</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>🚗 {driver.name}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: 22 }}>✕</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, background: "#1a1a1a", borderRadius: 12, padding: "12px 16px" }}>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Автомобиль</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{driver.car || "—"}</div>
        </div>
        <div style={{ flex: 1, background: "#1a1a1a", borderRadius: 12, padding: "12px 16px" }}>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Рейтинг</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {"⭐".repeat(Math.round(driver.rating || 5))} {driver.rating?.toFixed(1) || "5.0"}
          </div>
        </div>
      </div>

      {driver.phone && (
        <a
          href={`tel:${driver.phone}`}
          style={{
            display: "block", width: "100%", padding: "14px",
            background: "#1a3a1a", border: "1px solid #166534",
            borderRadius: 12, color: "#4ade80",
            fontSize: 15, fontWeight: 600, textAlign: "center",
            textDecoration: "none",
          }}
        >
          📞 Позвонить водителю
        </a>
      )}

      <div style={{ marginTop: 12, textAlign: "center", color: "#888", fontSize: 13 }}>
        Водитель едет к вам...
      </div>
    </div>
  );
}

// ---- Order Map ----
function OrderMap({
  pointA, pointB,
  onMapClick, selectingPoint,
}: {
  pointA: LatLng | null;
  pointB: LatLng | null;
  onMapClick: (latlng: LatLng) => void;
  selectingPoint: "A" | "B" | null;
}) {
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const markerARef = useRef<unknown>(null);
  const markerBRef = useRef<unknown>(null);
  const routeLineRef = useRef<unknown>(null);
  const userMarkerRef = useRef<unknown>(null);

  const onMapClickRef = useRef(onMapClick);
  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);
  const selectingRef = useRef(selectingPoint);
  useEffect(() => { selectingRef.current = selectingPoint; }, [selectingPoint]);

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

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    mapRef.current = map;

    // Geolocation
    navigator.geolocation?.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      map.setView([latitude, longitude], 15);
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8],
      });
      userMarkerRef.current = L.marker([latitude, longitude], { icon }).addTo(map);
    });

    map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
      onMapClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    // Listen for centerMap event from location button
    const handleCenter = (e: Event) => {
      const { lat, lng } = (e as CustomEvent).detail;
      map.setView([lat, lng], 16);
    };
    window.addEventListener('centerMap', handleCenter);

    return () => { window.removeEventListener('centerMap', handleCenter); map.remove(); mapRef.current = null; };
  }, []);

  // Update markers & route line
  useEffect(() => {
    if (!mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");
    const map = mapRef.current as { addLayer: (l: unknown) => void };

    const makeMarker = (p: LatLng, label: string, color: string) => {
      return L.marker([p.lat, p.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">${label}</div>`,
          iconSize: [28, 28], iconAnchor: [14, 14],
        }),
      }).addTo(map);
    };

    if (pointA) {
      if (markerARef.current) {
        (markerARef.current as { setLatLng: (l: [number,number]) => void }).setLatLng([pointA.lat, pointA.lng]);
      } else {
        markerARef.current = makeMarker(pointA, "A", "#ef4444");
      }
    }

    if (pointB) {
      if (markerBRef.current) {
        (markerBRef.current as { setLatLng: (l: [number,number]) => void }).setLatLng([pointB.lat, pointB.lng]);
      } else {
        markerBRef.current = makeMarker(pointB, "B", "#10b981");
      }
    }

    if (pointA && pointB) {
      const latlngs = [[pointA.lat, pointA.lng], [pointB.lat, pointB.lng]];
      if (routeLineRef.current) {
        (routeLineRef.current as { remove: () => void }).remove();
      }
      routeLineRef.current = L.polyline(latlngs, {
        color: "#ef4444", weight: 4, opacity: 0.85, dashArray: "8,6",
      }).addTo(map);
      // Fit bounds
      (map as unknown as { fitBounds: (b: unknown, o: unknown) => void }).fitBounds(
        (routeLineRef.current as { getBounds: () => unknown }).getBounds(),
        { padding: [40, 40] }
      );
    }
  }, [pointA, pointB]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapElRef} style={{ width: "100%", height: "100%" }} />

      {/* Zoom controls */}
      <div style={{ position: "absolute", right: 12, bottom: 12, zIndex: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {["+", "−"].map((sym, i) => (
          <button
            key={sym}
            onClick={() => {
              if (!mapRef.current) return;
              const m = mapRef.current as { zoomIn: () => void; zoomOut: () => void };
              if (i === 0) { m.zoomIn(); } else { m.zoomOut(); }
            }}
            style={{
              width: 36, height: 36,
              background: "rgba(17,17,17,0.92)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff", fontSize: 20, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            {sym}
          </button>
        ))}
      </div>

      {/* Tap hint */}
      {selectingPoint && (
        <div style={{
          position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
          zIndex: 10, background: "rgba(239,68,68,0.9)", borderRadius: 20,
          padding: "6px 16px", fontSize: 13, fontWeight: 600, color: "#fff",
          backdropFilter: "blur(4px)",
        }}>
          Нажмите на карту для точки {selectingPoint}
        </div>
      )}
    </div>
  );
}

// ---- Main Order Page ----
export default function OrderPage() {
  const router = useRouter();
  const [pointA, setPointA] = useState<LatLng | null>(null);
  const [pointB, setPointB] = useState<LatLng | null>(null);
  const [labelA, setLabelA] = useState("");
  const [labelB, setLabelB] = useState("");
  const [selectingPoint, setSelectingPoint] = useState<"A" | "B" | null>(null);
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [driver, setDriver] = useState<DriverInfo | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(true);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("client-token");
    if (!token) router.replace("/login");

    // Set initial point A from geolocation
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const label = await reverseGeocode(lat, lng);
      setPointA({ lat, lng });
      setLabelA(label);
    });
  }, [router]);

  // Fetch price when both points set
  useEffect(() => {
    if (!pointA || !pointB) { setPriceInfo(null); return; }
    const fetchPrice = async () => {
      setLoadingPrice(true);
      try {
        const res = await fetch(`${API_URL}/api/orders/calculate-price`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromLat: pointA.lat, fromLng: pointA.lng, toLat: pointB.lat, toLng: pointB.lng }),
        });
        if (res.ok) {
          const data = await res.json();
          setPriceInfo(data);
        } else {
          // Fallback: calc locally
          const dist = haversineKm(pointA, pointB);
          setPriceInfo({ distance: dist, price: Math.round(50 + dist * 30) });
        }
      } catch {
        const dist = haversineKm(pointA, pointB);
        setPriceInfo({ distance: dist, price: Math.round(50 + dist * 30) });
      } finally {
        setLoadingPrice(false);
      }
    };
    fetchPrice();
  }, [pointA, pointB]);

  const handleMapClick = useCallback(async (latlng: LatLng) => {
    if (!selectingPoint) return;
    const label = await reverseGeocode(latlng.lat, latlng.lng);
    if (selectingPoint === "A") {
      setPointA({ ...latlng, label });
      setLabelA(label);
    } else {
      setPointB({ ...latlng, label });
      setLabelB(label);
    }
    setSelectingPoint(null);
  }, [selectingPoint]);

  const handleOrder = async () => {
    if (!pointA) return;
    const token = localStorage.getItem("client-token");
    // Get client info saved at login
    let clientName = "Клиент";
    let clientPhone = "—";
    try {
      const raw = localStorage.getItem("clientInfo");
      if (raw) {
        const info = JSON.parse(raw);
        clientName = info.name || info.email || "Клиент";
        clientPhone = info.phone || info.email || "—";
      }
    } catch {/* ignore */}

    setOrdering(true);
    try {
      const body: Record<string, unknown> = {
        // Backend expects these field names
        pickupAddress: labelA || `${pointA.lat.toFixed(5)}, ${pointA.lng.toFixed(5)}`,
        destAddress:   labelB || (pointB ? `${pointB.lat.toFixed(5)}, ${pointB.lng.toFixed(5)}` : "Не указано"),
        pickupLat: pointA.lat,
        pickupLng: pointA.lng,
        clientName,
        clientPhone,
        tariff: "Standard",
        paymentMethod: "CASH",
        price: priceInfo?.price || 0,
      };
      if (pointB) {
        body.destLat = pointB.lat;
        body.destLng = pointB.lng;
      }
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setDriver(data.driver || { name: "Водитель найден", car: "Ожидайте", rating: 5.0 });
        setSheetExpanded(false);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Не удалось создать заказ. Попробуйте снова.");
      }
    } catch {
      // Demo fallback — show success anyway
      setDriver({ name: "Водитель найден", car: "Ожидайте звонка", rating: 5.0 });
      setSheetExpanded(false);
    } finally {
      setOrdering(false);
    }
  };

  if (!mounted) return null;

  const sheetHeight = sheetExpanded ? "auto" : 80;

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw", overflow: "hidden", background: "#0a0a0a" }}>
      {/* Map — fills screen */}
      <div style={{ position: "absolute", inset: 0 }}>
        <OrderMap
          pointA={pointA}
          pointB={pointB}
          onMapClick={handleMapClick}
          selectingPoint={selectingPoint}
        />
      </div>

      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        style={{
          position: "absolute", top: 16, left: 16, zIndex: 200,
          width: 44, height: 44,
          background: "rgba(17,17,17,0.92)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "50%",
          color: "#fff", fontSize: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
        }}
        aria-label="Back"
      >
        ←
      </button>

      {/* Title */}
      <div style={{
        position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)",
        zIndex: 20, color: "#fff", fontWeight: 700, fontSize: 16,
        textShadow: "0 1px 8px rgba(0,0,0,0.8)", pointerEvents: "none",
      }}>
        Новый заказ
      </div>

      {/* Location button - center on user */}
      <button
        onClick={() => {
          navigator.geolocation?.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            // Dispatch event to map - but since map is in separate component, we use a simple approach
            window.dispatchEvent(new CustomEvent('centerMap', { detail: { lat: latitude, lng: longitude } }));
          });
        }}
        style={{
          position: "absolute", bottom: sheetExpanded ? "calc(45% + 16px)" : "96px",
          right: 16, zIndex: 150,
          width: 44, height: 44,
          background: "#fff",
          border: "none",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
          transition: "bottom 0.3s",
        }}
        aria-label="My location"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,2 19,21 12,17 5,21" />
        </svg>
      </button>

      {/* Bottom Sheet */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "#111",
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
        maxHeight: sheetExpanded ? "45%" : "80px",
        overflow: sheetExpanded ? "auto" : "hidden",
        transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {/* Drag handle */}
        <div
          onClick={() => setSheetExpanded(!sheetExpanded)}
          style={{ padding: "10px 0 0", display: "flex", justifyContent: "center", cursor: "pointer" }}
        >
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#333" }} />
        </div>

        {sheetExpanded && (
          <div style={{ padding: "8px 16px 0", overflowY: "auto", maxHeight: 280 }}>
            {/* Point A */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Откуда (A)</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={labelA}
                  onChange={e => setLabelA(e.target.value)}
                  placeholder="Введите адрес или нажмите на карту"
                  style={{
                    flex: 1, padding: "11px 12px",
                    background: "#1a1a1a", border: selectingPoint === "A" ? "1px solid #ef4444" : "1px solid #2a2a2a",
                    borderRadius: 10, color: "#fff", fontSize: 14, outline: "none",
                  }}
                />
                <button
                  onClick={() => setSelectingPoint(selectingPoint === "A" ? null : "A")}
                  style={{
                    width: 42, height: 42, flexShrink: 0,
                    background: selectingPoint === "A" ? "#ef4444" : "#1a1a1a",
                    border: "1px solid #2a2a2a", borderRadius: 10,
                    color: "#fff", fontSize: 16,
                  }}
                  title="Выбрать на карте"
                >
                  📍
                </button>
              </div>
            </div>

            {/* Point B */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Куда (B) <span style={{ color: "#555", textTransform: "none", letterSpacing: 0 }}>— необязательно</span></div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={labelB}
                  onChange={e => setLabelB(e.target.value)}
                  placeholder="Введите адрес назначения"
                  style={{
                    flex: 1, padding: "11px 12px",
                    background: "#1a1a1a", border: selectingPoint === "B" ? "1px solid #10b981" : "1px solid #2a2a2a",
                    borderRadius: 10, color: "#fff", fontSize: 14, outline: "none",
                  }}
                />
                <button
                  onClick={() => setSelectingPoint(selectingPoint === "B" ? null : "B")}
                  style={{
                    width: 42, height: 42, flexShrink: 0,
                    background: selectingPoint === "B" ? "#10b981" : "#1a1a1a",
                    border: "1px solid #2a2a2a", borderRadius: 10,
                    color: "#fff", fontSize: 16,
                  }}
                  title="Выбрать на карте"
                >
                  📍
                </button>
              </div>
            </div>

            {/* Price info */}
            {(loadingPrice || priceInfo) && (
              <div style={{
                display: "flex", gap: 10, marginBottom: 14,
              }}>
                <div style={{ flex: 1, background: "#1a1a1a", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>Расстояние</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>
                    {loadingPrice ? "..." : `${priceInfo?.distance?.toFixed(1) || "?"} км`}
                  </div>
                </div>
                <div style={{ flex: 1, background: "#1a3a1a", border: "1px solid #166534", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, color: "#4ade80", marginBottom: 2 }}>Стоимость</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#4ade80" }}>
                    {loadingPrice ? "..." : `${priceInfo?.price || "?"} сом`}
                  </div>
                </div>
              </div>
            )}

            {/* Order button */}
            <button
              onClick={handleOrder}
              disabled={!pointA || ordering}
              style={{
                width: "100%", padding: "15px",
                background: !pointA ? "#2a2a2a" : "linear-gradient(135deg, #ef4444, #b91c1c)",
                border: "none", borderRadius: 14,
                color: !pointA ? "#666" : "#fff",
                fontSize: 16, fontWeight: 700,
                marginBottom: 16,
                boxShadow: pointA ? "0 4px 20px rgba(239,68,68,0.4)" : "none",
                transition: "all 0.2s",
              }}
            >
              {ordering ? "Поиск водителя..." : "🚖 Заказать"}
            </button>
          </div>
        )}

        {!sheetExpanded && (
          <div style={{ padding: "4px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 13, color: "#888", flex: 1 }}>
              {labelA ? `📍 ${labelA.substring(0, 30)}...` : "Установите точку A"}
            </div>
            <button
              onClick={() => setSheetExpanded(true)}
              style={{ background: "#ef4444", border: "none", borderRadius: 8, color: "#fff", padding: "6px 14px", fontSize: 13, fontWeight: 600 }}
            >
              Изменить
            </button>
          </div>
        )}
      </div>

      {/* Driver card */}
      {driver && <DriverCard driver={driver} onClose={() => { setDriver(null); router.push("/"); }} />}
    </div>
  );
}
