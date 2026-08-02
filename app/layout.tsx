import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Ekidos — Такси Токтогул",
  description: "Такси сервис в городе Токтогул, Кыргызстан",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <meta name="theme-color" content="#0a0a0a" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; overflow: hidden; background: #0a0a0a; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          #__next { height: 100%; }
          input { font-family: inherit; }
          button { font-family: inherit; cursor: pointer; }
          .leaflet-container { background: #1a1a2e !important; }
        `}</style>
      </head>
      <body style={{ height: "100%", overflow: "hidden" }}>{children}</body>
    </html>
  );
}
