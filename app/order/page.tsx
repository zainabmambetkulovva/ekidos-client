"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ekidos-taxi-production-587e.up.railway.app";

// Reverse geocode: coords -> street name
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ru`,
      { headers: { "User-Agent": "ekidos-client/1.0" } }
    );
    const data = await res.json();
    // Extract short address (street + house or first 2 parts)
    const addr = data.address;
    if (addr) {
      const parts = [addr.road, addr.house_number, addr.neighbourhood, addr.suburb].filter(Boolean);
      if (parts.length > 0) return parts.slice(0, 2).join(", ");
    }
    return data.display_name?.split(",").slice(0, 2).join(",").trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export default function OrderPage() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<{ from: any; to: any }>({ from: null, to: null });
  const socketRef = useRef<Socket | null>(null);

  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [fromCoords, setFromCoords] = useState<[number, number] | null>(null);
  const [toCoords, setToCoords] = useState<[number, number] | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [pickingPoint, setPickingPoint] = useState<"from" | "to" | null>(null);
  const [searching, setSearching] = useState(false);
  const [driver, setDriver] = useState<{
    name: string;
    car: string;
    plate: string;
    phone: string;
  } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const L = require("leaflet");

    // Fix default marker icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    const map = L.map(mapRef.current, {
      center: [41.2995, 69.2401], // Tashkent default
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Handle map clicks for point picking
    map.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      handleMapClick(lat, lng);
    });

    leafletMapRef.current = map;

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [
            pos.coords.latitude,
            pos.coords.longitude,
          ];
          setUserLocation(coords);
          map.setView(coords, 15);
        },
        () => {
          // Use default center if geolocation fails
        }
      );
    }

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle picking point state in map click
  const handleMapClick = (lat: number, lng: number) => {
    setPickingPoint((current) => {
      if (!current) return null;

      const L = require("leaflet");
      const map = leafletMapRef.current;
      if (!map) return null;

      if (current === "from") {
        if (markersRef.current.from) {
          map.removeLayer(markersRef.current.from);
        }
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: "custom-marker",
            html: '<div style="width:14px;height:14px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
        }).addTo(map);
        markersRef.current.from = marker;
        setFromCoords([lat, lng]);
        // Reverse geocode to get street name
        reverseGeocode(lat, lng).then(addr => setFromAddress(addr));
      } else if (current === "to") {
        if (markersRef.current.to) {
          map.removeLayer(markersRef.current.to);
        }
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: "custom-marker",
            html: '<div style="width:14px;height:14px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
        }).addTo(map);
        markersRef.current.to = marker;
        setToCoords([lat, lng]);
        reverseGeocode(lat, lng).then(addr => setToAddress(addr));
      }

      return null; // Reset picking state
    });
  };

  // Calculate price when both points are set
  useEffect(() => {
    if (fromCoords && toCoords) {
      const R = 6371;
      const dLat = ((toCoords[0] - fromCoords[0]) * Math.PI) / 180;
      const dLon = ((toCoords[1] - fromCoords[1]) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((fromCoords[0] * Math.PI) / 180) *
          Math.cos((toCoords[0] * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // km
      const roadDistance = distance * 1.4; // road is ~1.4x straight line
      const calculatedPrice = Math.round(50 + roadDistance * 30); // 50 сом base + 30 som/km
      setPrice(calculatedPrice);
    }
  }, [fromCoords, toCoords]);

  // Draw route line between A and B
  useEffect(() => {
    if (!fromCoords || !toCoords || !leafletMapRef.current) return;
    const L = require("leaflet");
    const map = leafletMapRef.current;
    // Remove old line
    if ((window as any).__routeLine) { map.removeLayer((window as any).__routeLine); }
    (window as any).__routeLine = L.polyline(
      [fromCoords, toCoords],
      { color: "#ef4444", weight: 3, dashArray: "8,6", opacity: 0.8 }
    ).addTo(map);
    map.fitBounds([(window as any).__routeLine].getBounds ? (window as any).__routeLine.getBounds() : [fromCoords, toCoords], { padding: [50, 50] });
    return () => { if ((window as any).__routeLine) { map.removeLayer((window as any).__routeLine); } };
  }, [fromCoords, toCoords]);


  // Socket.io connection for real-time updates
  useEffect(() => {
    if (!orderId) return;

    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-order", orderId);
    });

    socket.on("order-accepted", (data: any) => {
      setSearching(false);
      setDriver({
        name: data.driverName || data.name || "Driver",
        car: data.car || data.vehicle || "Unknown",
        plate: data.plate || data.licensePlate || "Unknown",
        phone: data.phone || data.driverPhone || "Unknown",
      });
    });

    // Driver arrived - show full driver info
    socket.on("driver:arrived", (data: any) => {
      if (data.orderId !== orderId) return;
      setSearching(false);
      setDriver({
        name: data.driverName || "Driver",
        car: data.car || "",
        plate: data.plate || "",
        phone: data.phone || "",
      });
    });

    socket.on("order:accepted", (data: any) => {
      // Only react if this is OUR order
      if (data.id !== orderId && data.orderId !== orderId) return;
      setSearching(false);
      setDriver({
        name: (data.driver?.firstName || "") + " " + (data.driver?.lastName || ""),
        car: (data.driver?.vehicle?.brand || "") + " " + (data.driver?.vehicle?.model || ""),
        plate: data.driver?.vehicle?.plateNumber || "",
        phone: data.driver?.phone || "",
      });
    });

    // Also listen for order:taken (has driverId, fetch driver info)
    socket.on("order:taken", async (data: any) => {
      if (data.orderId !== orderId) return;
      setSearching(false);
      // Fetch driver public info
      try {
        const res = await fetch(`${API_URL}/api/drivers/${data.driverId}/public`);
        if (res.ok) {
          const d = await res.json();
          setDriver({
            name: (d.firstName || "") + " " + (d.lastName || ""),
            car: (d.vehicle?.brand || "") + " " + (d.vehicle?.model || ""),
            plate: d.vehicle?.plateNumber || "",
            phone: d.phone || "",
          });
        }
      } catch {}
    });

    socket.on("order-cancelled", () => {
      setSearching(false);
      setDriver(null);
      setOrderId(null);
      alert("\u0417\u0430\u043A\u0430\u0437 \u0436\u043E\u043A\u043A\u043E \u0447\u044B\u0433\u0430\u0440\u044B\u043B\u0434\u044B");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [orderId]);

  const handleOrder = async () => {
    if (!fromCoords) return;

    setSearching(true);
    setDriver(null);

    // Get client info from localStorage
    let clientName = "Client";
    let clientPhone = "-";
    try {
      const raw = localStorage.getItem("clientInfo");
      if (raw) {
        const info = JSON.parse(raw);
        clientName = info.name || info.email || "Client";
        clientPhone = info.phone || info.email || "-";
      }
    } catch {}

    try {
      const token = localStorage.getItem("client-token");
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pickupAddress: fromAddress || `${fromCoords[0].toFixed(5)}, ${fromCoords[1].toFixed(5)}`,
          destAddress: toAddress || (toCoords ? `${toCoords[0].toFixed(5)}, ${toCoords[1].toFixed(5)}` : "Not specified"),
          pickupLat: fromCoords[0],
          pickupLng: fromCoords[1],
          destLat: toCoords?.[0] || null,
          destLng: toCoords?.[1] || null,
          clientName,
          clientPhone,
          tariff: "Standard",
          paymentMethod: "CASH",
          price: price || 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create order");
      }

      const data = await res.json();
      setOrderId(data.id || data.orderId || data._id);
    } catch (err: any) {
      console.error("Order error:", err);
      setSearching(false);
      alert(err.message || "\u0417\u0430\u043A\u0430\u0437 \u0436\u04E9\u043D\u04E9\u0442\u04AF\u043B\u0431\u04E9\u0434\u04AF. \u041A\u0430\u0439\u0440\u0430 \u0430\u0440\u0430\u043A\u0435\u0442 \u043A\u044B\u043B\u044B\u04A3\u044B\u0437.");
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation && leafletMapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [
            pos.coords.latitude,
            pos.coords.longitude,
          ];
          setUserLocation(coords);
          leafletMapRef.current.setView(coords, 16);
        },
        () => {
          alert("\u0416\u0435\u0440\u0438\u04A3\u0438\u0437\u0434\u0438 \u0430\u043D\u044B\u043A\u0442\u043E\u043E \u043C\u04AF\u043C\u043A\u04AF\u043D \u044D\u043C\u0435\u0441");
        }
      );
    }
  };

  const cancelSearch = () => {
    setSearching(false);
    if (socketRef.current && orderId) {
      socketRef.current.emit("cancel-order", orderId);
    }
    setOrderId(null);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />

      {/* Map Container - Full Screen */}
      <div
        ref={mapRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      />

      {/* Burger Menu Button */}
      <button
        onClick={() => router.push("/settings")}
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 200,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "white",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 18,
        }}
        aria-label="Menu"
      >
        &#9776;
      </button>

      {/* Back to home */}
      <button
        onClick={() => router.push("/")}
        style={{
          position: "absolute",
          top: 16,
          left: 68,
          zIndex: 200,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "white",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 20,
        }}
      >
        &#8592;
      </button>

      {/* Picking Point Indicator */}
      {pickingPoint && (
        <div
          style={{
            position: "absolute",
            top: 70,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 200,
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "8px 16px",
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {pickingPoint === "from" ? "Алуу чекитин тандаңыз" : "Жеткирүү чекитин тандаңыз"}
        </div>
      )}

      {/* Location Button */}
      <button
        onClick={handleLocateMe}
        style={{
          position: "absolute",
          bottom: "calc(45% + 16px)",
          right: 16,
          zIndex: 200,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "white",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 18,
        }}
      >
        &#9678;
      </button>

      {/* Bottom Panel Overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "45%",
          zIndex: 100,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85))",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: "20px 16px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* From Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            A
          </div>
          <input
            type="text"
            placeholder="Кайдан (A)"
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            onClick={() => setPickingPoint(pickingPoint === "from" ? null : "from")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: pickingPoint === "from" ? "2px solid #22c55e" : "1px solid rgba(255,255,255,0.3)",
              background: pickingPoint === "from" ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.1)",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
            title="Pick on map"
          >
            &#128205;
          </button>
        </div>

        {/* To Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            B
          </div>
          <input
            type="text"
            placeholder="Кайда (B)"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            onClick={() => setPickingPoint(pickingPoint === "to" ? null : "to")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: pickingPoint === "to" ? "2px solid #ef4444" : "1px solid rgba(255,255,255,0.3)",
              background: pickingPoint === "to" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.1)",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
            title="Pick on map"
          >
            &#128205;
          </button>
        </div>

        {/* Price Display */}
        {price !== null && (
          <div
            style={{
              textAlign: "center",
              color: "white",
              fontSize: 22,
              fontWeight: 700,
              padding: "4px 0",
            }}
          >
            {price.toLocaleString()} som
          </div>
        )}

        {/* Order Button */}
        <button
          onClick={handleOrder}
          disabled={!fromCoords && !fromAddress || searching}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 12,
            border: "none",
            background:
              (fromCoords || fromAddress) && !searching
                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                : "rgba(255,255,255,0.15)",
            color: (fromCoords || fromAddress) ? "#fff" : "rgba(255,255,255,0.4)",
            fontSize: 16,
            fontWeight: 700,
            cursor: fromCoords && !searching ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          Заказ берүү
        </button>
      </div>

      {/* Searching Overlay */}
      {searching && !driver && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 300,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              border: "4px solid rgba(255,255,255,0.2)",
              borderTopColor: "#facc15",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "white", fontSize: 18, fontWeight: 600 }}>
            Айдоочу издөөдө...
          </p>
          <button
            onClick={cancelSearch}
            style={{
              marginTop: 12,
              padding: "10px 24px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Driver Info Overlay */}
      {driver && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 300,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9))",
            backdropFilter: "blur(12px)",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <h3
            style={{
              color: "#22c55e",
              fontSize: 16,
              fontWeight: 600,
              margin: 0,
              textAlign: "center",
            }}
          >
            Айдоочу жолдо!
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "white" }}>
              <span style={{ opacity: 0.7, fontSize: 14 }}>Аты</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{driver.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "white" }}>
              <span style={{ opacity: 0.7, fontSize: 14 }}>Унаа</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{driver.car}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "white" }}>
              <span style={{ opacity: 0.7, fontSize: 14 }}>Номери</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{driver.plate}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "white" }}>
              <span style={{ opacity: 0.7, fontSize: 14 }}>Телефон</span>
              <a
                href={`tel:${driver.phone}`}
                style={{ fontWeight: 600, fontSize: 14, color: "#facc15", textDecoration: "none" }}
              >
                {driver.phone}
              </a>
            </div>
          </div>

          <button
            onClick={() => {
              setDriver(null);
              setOrderId(null);
              setSearching(false);
            }}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
