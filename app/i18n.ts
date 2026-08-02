export type Lang = "ru" | "ky" | "en";

export const TEXTS: Record<Lang, Record<string, string>> = {
  ru: {
    orderTaxi: "\u{1F696} \u0417\u0430\u043A\u0430\u0437\u0430\u0442\u044C \u0442\u0430\u043A\u0441\u0438",
    subtitle: "\u0422\u043E\u043A\u0442\u043E\u0433\u0443\u043B \u2014 \u0431\u044B\u0441\u0442\u0440\u043E \u0438 \u043D\u0430\u0434\u0451\u0436\u043D\u043E",
    profile: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C",
    settings: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
    logout: "\u0412\u044B\u0439\u0442\u0438",
    guest: "\u0413\u043E\u0441\u0442\u044C",
    openMenu: "\u041C\u0435\u043D\u044E",
    toktogul: "\u0422\u043E\u043A\u0442\u043E\u0433\u0443\u043B",
    newOrder: "\u041D\u043E\u0432\u044B\u0439 \u0437\u0430\u043A\u0430\u0437",
    fromA: "\u041E\u0442\u043A\u0443\u0434\u0430 (A)",
    toB: "\u041A\u0443\u0434\u0430 (B) \u2014 \u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E",
    order: "\u0417\u0430\u043A\u0430\u0437\u0430\u0442\u044C",
    searching: "\u041F\u043E\u0438\u0441\u043A \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F...",
    selectOnMap: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u043A\u0430\u0440\u0442\u0443 \u0434\u043B\u044F \u0442\u043E\u0447\u043A\u0438",
    distance: "\u0420\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435",
    price: "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C",
    km: "\u043A\u043C",
    som: "\u0441\u043E\u043C",
    driverFound: "\u0412\u043E\u0434\u0438\u0442\u0435\u043B\u044C \u043D\u0430\u0439\u0434\u0435\u043D",
    waiting: "\u041E\u0436\u0438\u0434\u0430\u0439\u0442\u0435",
    close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
  },
  ky: {
    orderTaxi: "\u{1F696} \u0422\u0430\u043A\u0441\u0438 \u0447\u0430\u043A\u044B\u0440\u0443\u0443",
    subtitle: "\u0422\u043E\u043A\u0442\u043E\u0433\u0443\u043B \u2014 \u0442\u0435\u0437 \u0436\u0430\u043D\u0430 \u0438\u0448\u0435\u043D\u0438\u043C\u0434\u04AF\u04AF",
    profile: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C",
    settings: "\u041E\u0440\u043D\u043E\u0442\u0443\u0443\u043B\u0430\u0440",
    logout: "\u0427\u044B\u0433\u0443\u0443",
    guest: "\u041A\u043E\u043D\u043E\u043A",
    openMenu: "\u041C\u0435\u043D\u044E",
    toktogul: "\u0422\u043E\u043A\u0442\u043E\u0433\u0443\u043B",
    newOrder: "\u0416\u0430\u04A3\u044B \u0437\u0430\u043A\u0430\u0437",
    fromA: "\u041A\u0430\u0439\u0434\u0430\u043D (A)",
    toB: "\u041A\u0430\u0439\u0434\u0430 (B) \u2014 \u043C\u0438\u043B\u0434\u0435\u0442\u0442\u04AF\u04AF \u044D\u043C\u0435\u0441",
    order: "\u0417\u0430\u043A\u0430\u0437 \u0431\u0435\u0440\u04AF\u04AF",
    searching: "\u0410\u0439\u0434\u043E\u043E\u0447\u0443 \u0438\u0437\u0434\u04E9\u04E9\u0434\u04E9...",
    selectOnMap: "\u041A\u0430\u0440\u0442\u0430\u0433\u0430 \u0431\u0430\u0441\u044B\u04A3\u044B\u0437",
    distance: "\u0410\u0440\u0430\u043B\u044B\u043A",
    price: "\u0411\u0430\u0430\u0441\u044B",
    km: "\u043A\u043C",
    som: "\u0441\u043E\u043C",
    driverFound: "\u0410\u0439\u0434\u043E\u043E\u0447\u0443 \u0442\u0430\u0431\u044B\u043B\u0434\u044B",
    waiting: "\u041A\u04AF\u0442\u04AF\u04A3\u04AF\u0437",
    close: "\u0416\u0430\u0431\u0443\u0443",
  },
  en: {
    orderTaxi: "\u{1F696} Order Taxi",
    subtitle: "Toktogul - fast & reliable",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    guest: "Guest",
    openMenu: "Menu",
    toktogul: "Toktogul",
    newOrder: "New order",
    fromA: "From (A)",
    toB: "To (B) - optional",
    order: "Order",
    searching: "Searching driver...",
    selectOnMap: "Tap on map for point",
    distance: "Distance",
    price: "Price",
    km: "km",
    som: "som",
    driverFound: "Driver found",
    waiting: "Please wait",
    close: "Close",
  },
};

export function getLang(): Lang {
  if (typeof window === "undefined") return "ru";
  try {
    const raw = localStorage.getItem("ekidos-settings");
    if (raw) {
      const s = JSON.parse(raw);
      if (s.language === "ky" || s.language === "en") return s.language;
    }
  } catch {}
  return "ru";
}

export function t(key: string): string {
  const lang = getLang();
  return TEXTS[lang]?.[key] || TEXTS.ru[key] || key;
}
