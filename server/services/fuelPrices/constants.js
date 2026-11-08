export const OGRA_PRICE_PORTAL = "https://price.ogra.org.pk";
export const OGRA_NOTIFIED_LISTING =
  "https://www.ogra.org.pk/notified-petroleum-prices";
export const OGRA_PRICE_PUBLICATION_LISTING =
  "https://www.ogra.org.pk/price-publication";

export const USER_AGENT =
  "SelloFuelPriceMonitor/1.0 (+https://sello.pk/petrol-prices; official OGRA source monitoring)";

export const REQUEST_TIMEOUT_MS = 45000;
export const MIN_REQUEST_GAP_MS = 900;

/** Plausible national ex-depot / notified PKR/litre band for sanity checks. */
export const PRICE_SANITY = {
  min: 50,
  max: 900,
};

export const FUEL_ALIASES = [
  {
    fuel_type: "motor_spirit",
    label: "Premier Euro 5 (Petrol / Motor Spirit)",
    patterns: [
      /total\s+petrol\s+price[\s\S]{0,120}?(\d{2,3}(?:\.\d{1,2})?)/i,
      /motor\s+spirit\s*\(?\s*ms\s*\)?[\s\S]{0,80}?(\d{2,3}(?:\.\d{1,2})?)/i,
      /\bpetrol\s*\(?\s*ms\s*\)?[\s\S]{0,80}?(\d{2,3}(?:\.\d{1,2})?)/i,
    ],
  },
  {
    fuel_type: "hi_octane",
    label: "Octane+ Euro 5 (Hi-Octane)",
    patterns: [
      /(?:hi[- ]?octane|octane\+|premium\s+petrol)[\s\S]{0,80}?(\d{2,3}(?:\.\d{1,2})?)/i,
    ],
  },
  {
    fuel_type: "high_speed_diesel",
    label: "Hi-Cetane Diesel Euro 5 (HSD)",
    patterns: [
      /total\s+diesel\s+price[\s\S]{0,120}?(\d{2,3}(?:\.\d{1,2})?)/i,
      /high\s*speed\s*diesel\s*\(?\s*hsd\s*\)?[\s\S]{0,80}?(\d{2,3}(?:\.\d{1,2})?)/i,
      /\bhsd\b[\s\S]{0,80}?(\d{2,3}(?:\.\d{1,2})?)/i,
    ],
  },
  {
    fuel_type: "kerosene_oil",
    label: "Superior Kerosene Oil (SKO)",
    patterns: [
      /kerosene(?:\s+oil)?[\s\S]{0,80}?(\d{2,3}(?:\.\d{1,2})?)/i,
      /\bsko\b[\s\S]{0,80}?(\d{2,3}(?:\.\d{1,2})?)/i,
    ],
  },
  {
    fuel_type: "light_diesel_oil",
    label: "Light Diesel Oil (LDO)",
    patterns: [
      /light\s+diesel(?:\s+oil)?[\s\S]{0,80}?(\d{2,3}(?:\.\d{1,2})?)/i,
      /\bldo\b[\s\S]{0,80}?(\d{2,3}(?:\.\d{1,2})?)/i,
    ],
  },
  {
    fuel_type: "lpg",
    label: "Liquefied Petroleum Gas (LPG)",
    patterns: [/\blpg\b[\s\S]{0,80}?(\d{2,3}(?:\.\d{1,2})?)/i],
  },
];
