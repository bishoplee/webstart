export type CurrencyCode =
  | "NGN"
  | "GHS"
  | "USD"
  | "GBP"
  | "EUR"
  | "KES"
  | "ZAR"
  | "CAD";

export interface LocaleCurrencyConfig {
  code: CurrencyCode;
  country: string;
  countryCode: string;
  name: string;
  symbol: string;
  altSymbol?: string;
  /** Exchange rate relative to $1.00 USD */
  ratePerUsd: number;
  locale: string;
}

export const LOCALE_CURRENCIES: Record<CurrencyCode, LocaleCurrencyConfig> = {
  NGN: {
    code: "NGN",
    country: "Nigeria",
    countryCode: "NG",
    name: "Nigerian Naira",
    symbol: "₦",
    altSymbol: "#",
    ratePerUsd: 1364,
    locale: "en-NG",
  },
  GHS: {
    code: "GHS",
    country: "Ghana",
    countryCode: "GH",
    name: "Ghanaian Cedi",
    symbol: "GH₵",
    ratePerUsd: 15.8,
    locale: "en-GH",
  },
  USD: {
    code: "USD",
    country: "United States",
    countryCode: "US",
    name: "US Dollar",
    symbol: "$",
    ratePerUsd: 1,
    locale: "en-US",
  },
  GBP: {
    code: "GBP",
    country: "United Kingdom",
    countryCode: "GB",
    name: "British Pound",
    symbol: "£",
    ratePerUsd: 0.79,
    locale: "en-GB",
  },
  EUR: {
    code: "EUR",
    country: "European Union",
    countryCode: "EU",
    name: "Euro",
    symbol: "€",
    ratePerUsd: 0.92,
    locale: "en-IE",
  },
  KES: {
    code: "KES",
    country: "Kenya",
    countryCode: "KE",
    name: "Kenyan Shilling",
    symbol: "KSh",
    ratePerUsd: 129,
    locale: "en-KE",
  },
  ZAR: {
    code: "ZAR",
    country: "South Africa",
    countryCode: "ZA",
    name: "South African Rand",
    symbol: "R",
    ratePerUsd: 18.2,
    locale: "en-ZA",
  },
  CAD: {
    code: "CAD",
    country: "Canada",
    countryCode: "CA",
    name: "Canadian Dollar",
    symbol: "CA$",
    ratePerUsd: 1.39,
    locale: "en-CA",
  },
};

export const CURRENCY_LIST: LocaleCurrencyConfig[] =
  Object.values(LOCALE_CURRENCIES);

export interface BudgetTierDefinition {
  value: string;
  tierLabel: string;
  minUsd?: number;
  maxUsd?: number;
}

export const STANDARD_BUDGET_TIERS: BudgetTierDefinition[] = [
  {
    value: "under_1500_usd",
    tierLabel: "Starter Tier",
    maxUsd: 1500,
  },
  {
    value: "1500_to_3500_usd",
    tierLabel: "Growth Tier",
    minUsd: 1500,
    maxUsd: 3500,
  },
  {
    value: "3500_to_7500_usd",
    tierLabel: "Business / Portal Tier",
    minUsd: 3500,
    maxUsd: 7500,
  },
  {
    value: "above_7500_usd",
    tierLabel: "Enterprise / Custom Platform",
    minUsd: 7500,
  },
  {
    value: "need_proposal",
    tierLabel: "Open — Recommend based on our requirements",
  },
];

/**
 * Resolves the appropriate currency code from a country name, address string, or browser locale.
 */
export function detectCurrencyFromCountryOrLocale(
  countryOrLocation?: string | null,
  browserLocale?: string | null
): CurrencyCode {
  if (countryOrLocation) {
    const norm = countryOrLocation.trim().toLowerCase();
    if (
      norm.includes("nigeria") ||
      norm.includes("lagos") ||
      norm.includes("abuja") ||
      norm.includes("port harcourt") ||
      norm === "ng"
    ) {
      return "NGN";
    }
    if (
      norm.includes("ghana") ||
      norm.includes("accra") ||
      norm.includes("kumasi") ||
      norm.includes("tema") ||
      norm === "gh"
    ) {
      return "GHS";
    }
    if (
      norm.includes("united states") ||
      norm.includes("usa") ||
      norm === "us" ||
      norm.includes("america")
    ) {
      return "USD";
    }
    if (
      norm.includes("united kingdom") ||
      norm.includes("uk") ||
      norm.includes("england") ||
      norm.includes("london") ||
      norm === "gb"
    ) {
      return "GBP";
    }
    if (
      norm.includes("kenya") ||
      norm.includes("nairobi") ||
      norm === "ke"
    ) {
      return "KES";
    }
    if (
      norm.includes("south africa") ||
      norm.includes("johannesburg") ||
      norm.includes("cape town") ||
      norm === "za"
    ) {
      return "ZAR";
    }
    if (norm.includes("canada") || norm.includes("toronto") || norm === "ca") {
      return "CAD";
    }
    if (
      norm.includes("europe") ||
      norm.includes("germany") ||
      norm.includes("france") ||
      norm.includes("netherlands") ||
      norm === "eu"
    ) {
      return "EUR";
    }
  }

  if (browserLocale) {
    const upper = browserLocale.toUpperCase();
    if (upper.includes("NG")) return "NGN";
    if (upper.includes("GH")) return "GHS";
    if (upper.includes("GB")) return "GBP";
    if (upper.includes("KE")) return "KES";
    if (upper.includes("ZA")) return "ZAR";
    if (upper.includes("CA")) return "CAD";
    if (upper.includes("US")) return "USD";
  }

  return "NGN";
}

/**
 * Converts a USD amount into the target currency using the configured exchange rate.
 */
export function convertFromUsd(
  usdAmount: number,
  currencyCode: CurrencyCode
): number {
  const cfg = LOCALE_CURRENCIES[currencyCode] ?? LOCALE_CURRENCIES.USD;
  return Math.round(usdAmount * cfg.ratePerUsd);
}

/**
 * Converts an amount in a local currency back to USD equivalent.
 */
export function convertToUsd(
  localAmount: number,
  currencyCode: CurrencyCode
): number {
  const cfg = LOCALE_CURRENCIES[currencyCode] ?? LOCALE_CURRENCIES.USD;
  if (cfg.ratePerUsd <= 0) return localAmount;
  return Math.round((localAmount / cfg.ratePerUsd) * 100) / 100;
}

/**
 * Formats a numeric value in the specified currency (e.g., ₦2,046,000 or GH₵23,700 or $1,500).
 */
export function formatLocalCurrency(
  amountInLocalCurrency: number,
  currencyCode: CurrencyCode
): string {
  const cfg = LOCALE_CURRENCIES[currencyCode] ?? LOCALE_CURRENCIES.USD;
  const formattedNumber = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(amountInLocalCurrency));
  return `${cfg.symbol}${formattedNumber}`;
}

/**
 * Converts a USD amount and formats it in the target currency.
 */
export function formatUsdInCurrency(
  usdAmount: number,
  currencyCode: CurrencyCode,
  includeUsdReference = false
): string {
  const localAmount = convertFromUsd(usdAmount, currencyCode);
  const localFormatted = formatLocalCurrency(localAmount, currencyCode);

  if (!includeUsdReference || currencyCode === "USD") {
    return localFormatted;
  }
  const usdFormatted = formatLocalCurrency(usdAmount, "USD");
  return `${localFormatted} (${usdFormatted})`;
}

/**
 * Returns the exchange rate summary badge string (e.g. "$1 = ₦1,364" or "$1 = GH₵15.80").
 */
export function formatExchangeRateLabel(currencyCode: CurrencyCode): string {
  const cfg = LOCALE_CURRENCIES[currencyCode] ?? LOCALE_CURRENCIES.USD;
  if (cfg.code === "USD") {
    return "Base Currency ($1 = $1.00)";
  }
  const rateStr =
    cfg.ratePerUsd >= 100
      ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
          cfg.ratePerUsd
        )
      : cfg.ratePerUsd.toFixed(2).replace(/\.00$/, "");
  return `$1 = ${cfg.symbol}${rateStr}`;
}

/**
 * Formats a budget tier key (e.g. "3500_to_7500_usd") or a USD range string (e.g. "$3,500 – $7,500")
 * into the selected locale currency.
 */
export function formatBudgetRangeForCurrency(
  rawBudgetValue: string | null | undefined,
  currencyCode: CurrencyCode
): string {
  if (!rawBudgetValue || !rawBudgetValue.trim()) {
    return "TBD";
  }

  const trimmed = rawBudgetValue.trim();

  // 1. Check standard tier key
  const tier = STANDARD_BUDGET_TIERS.find((t) => t.value === trimmed);
  if (tier) {
    if (tier.minUsd !== undefined && tier.maxUsd !== undefined) {
      const minLocal = formatUsdInCurrency(tier.minUsd, currencyCode);
      const maxLocal = formatUsdInCurrency(tier.maxUsd, currencyCode);
      const usdSuffix =
        currencyCode === "USD"
          ? ""
          : ` ($${tier.minUsd.toLocaleString("en-US")} – $${tier.maxUsd.toLocaleString("en-US")})`;
      return `${tier.tierLabel} (${minLocal} – ${maxLocal}${usdSuffix})`;
    }
    if (tier.maxUsd !== undefined) {
      const maxLocal = formatUsdInCurrency(tier.maxUsd, currencyCode);
      const usdSuffix =
        currencyCode === "USD"
          ? ""
          : ` (Under $${tier.maxUsd.toLocaleString("en-US")})`;
      return `${tier.tierLabel} (Under ${maxLocal}${usdSuffix})`;
    }
    if (tier.minUsd !== undefined) {
      const minLocal = formatUsdInCurrency(tier.minUsd, currencyCode);
      const usdSuffix =
        currencyCode === "USD"
          ? ""
          : ` ($${tier.minUsd.toLocaleString("en-US")}+)`;
      return `${tier.tierLabel} (${minLocal}+${usdSuffix})`;
    }
    return tier.tierLabel;
  }

  // 2. Parse USD range strings like "$3,500 – $7,500" or "$1,500 - $3,500"
  const usdMatches = Array.from(trimmed.matchAll(/\$\s*([\d,]+)/g));
  if (usdMatches.length >= 2) {
    const firstUsd = Number(usdMatches[0][1].replace(/,/g, ""));
    const secondUsd = Number(usdMatches[1][1].replace(/,/g, ""));
    if (!Number.isNaN(firstUsd) && !Number.isNaN(secondUsd)) {
      if (currencyCode === "USD") {
        return `${formatLocalCurrency(firstUsd, "USD")} – ${formatLocalCurrency(secondUsd, "USD")}`;
      }
      return `${formatUsdInCurrency(firstUsd, currencyCode)} – ${formatUsdInCurrency(secondUsd, currencyCode)} ($${firstUsd.toLocaleString("en-US")} – $${secondUsd.toLocaleString("en-US")})`;
    }
  } else if (usdMatches.length === 1) {
    const singleUsd = Number(usdMatches[0][1].replace(/,/g, ""));
    if (!Number.isNaN(singleUsd) && currencyCode !== "USD") {
      return `${formatUsdInCurrency(singleUsd, currencyCode)} (${trimmed})`;
    }
  }

  return trimmed;
}

/**
 * Generates localized dropdown options for the budget_range field in the active currency.
 */
export function getLocalizedBudgetTierOptions(
  currencyCode: CurrencyCode
): Array<{ value: string; label: string }> {
  return STANDARD_BUDGET_TIERS.map((tier) => ({
    value: tier.value,
    label: formatBudgetRangeForCurrency(tier.value, currencyCode),
  }));
}
