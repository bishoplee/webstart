import { describe, expect, it } from "vitest";
import {
  convertFromUsd,
  convertToUsd,
  detectCurrencyFromCountryOrLocale,
  formatBudgetRangeForCurrency,
  formatExchangeRateLabel,
  formatUsdInCurrency,
  LOCALE_CURRENCIES,
} from "@/lib/currency";

describe("Locale Currency & Exchange Rate Engine", () => {
  it("converts USD to Nigeria Naira at $1 = ₦1,364 and Ghana Cedis at $1 = GH₵15.80", () => {
    expect(LOCALE_CURRENCIES.NGN.ratePerUsd).toBe(1364);
    expect(convertFromUsd(1, "NGN")).toBe(1364);
    expect(convertFromUsd(1000, "NGN")).toBe(1364000);
    expect(formatExchangeRateLabel("NGN")).toBe("$1 = ₦1,364");

    expect(LOCALE_CURRENCIES.GHS.symbol).toBe("GH₵");
    expect(convertFromUsd(1000, "GHS")).toBe(15800);
    expect(formatExchangeRateLabel("GHS")).toBe("$1 = GH₵15.80");

    expect(convertFromUsd(1000, "USD")).toBe(1000);
    expect(convertToUsd(1364, "NGN")).toBe(1);
  });

  it("auto-detects currency from country names, cities, and browser locales", () => {
    expect(detectCurrencyFromCountryOrLocale("Nigeria")).toBe("NGN");
    expect(detectCurrencyFromCountryOrLocale("Lagos, Nigeria")).toBe("NGN");
    expect(detectCurrencyFromCountryOrLocale("Accra, Ghana")).toBe("GHS");
    expect(detectCurrencyFromCountryOrLocale("United States")).toBe("USD");
    expect(detectCurrencyFromCountryOrLocale("London, UK")).toBe("GBP");
    expect(detectCurrencyFromCountryOrLocale("Nairobi, Kenya")).toBe("KES");
    expect(detectCurrencyFromCountryOrLocale(null, "en-GH")).toBe("GHS");
  });

  it("formats budget tiers and USD range strings into localized Naira, Cedis, and Dollars", () => {
    // 1500 to 3500 USD in NGN ($1 = ₦1,364 -> ₦2,046,000 – ₦4,774,000)
    const ngnTier = formatBudgetRangeForCurrency("1500_to_3500_usd", "NGN");
    expect(ngnTier).toContain("₦2,046,000");
    expect(ngnTier).toContain("₦4,774,000");

    // 1500 to 3500 USD in GHS ($1 = GH₵15.80 -> GH₵23,700 – GH₵55,300)
    const ghsTier = formatBudgetRangeForCurrency("1500_to_3500_usd", "GHS");
    expect(ghsTier).toContain("GH₵23,700");
    expect(ghsTier).toContain("GH₵55,300");

    // Raw USD range string "$3,500 – $7,500" in NGN
    const rawRangeNgn = formatBudgetRangeForCurrency("$3,500 – $7,500", "NGN");
    expect(rawRangeNgn).toContain("₦4,774,000 – ₦10,230,000");

    // Single USD amount formatted with reference
    expect(formatUsdInCurrency(100, "NGN", true)).toBe("₦136,400 ($100)");
  });
});
