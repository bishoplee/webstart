"use client";

import * as React from "react";
import {
  type CurrencyCode,
  detectCurrencyFromCountryOrLocale,
  formatBudgetRangeForCurrency,
  formatExchangeRateLabel,
  formatUsdInCurrency,
  LOCALE_CURRENCIES,
  type LocaleCurrencyConfig,
} from "@/lib/currency";

interface CurrencyContextValue {
  currencyCode: CurrencyCode;
  currencyConfig: LocaleCurrencyConfig;
  exchangeRateLabel: string;
  setCurrencyCode: (code: CurrencyCode) => void;
  syncFromCountryHint: (countryOrLocation?: string | null) => void;
  formatBudget: (rawBudgetValue: string | null | undefined) => string;
  formatUsd: (usdAmount: number, includeUsdReference?: boolean) => string;
}

const STORAGE_KEY = "webstart_locale_currency";

const CurrencyContext = React.createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCodeState] =
    React.useState<CurrencyCode>("NGN");
  const [hasExplicitUserSelection, setHasExplicitUserSelection] =
    React.useState(false);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(
        STORAGE_KEY
      ) as CurrencyCode | null;
      if (stored && LOCALE_CURRENCIES[stored]) {
        setCurrencyCodeState(stored);
        setHasExplicitUserSelection(true);
        return;
      }
      const detected = detectCurrencyFromCountryOrLocale(
        null,
        window.navigator.language
      );
      setCurrencyCodeState(detected);
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const setCurrencyCode = React.useCallback((code: CurrencyCode) => {
    if (!LOCALE_CURRENCIES[code]) return;
    setCurrencyCodeState(code);
    setHasExplicitUserSelection(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Ignore
    }
  }, []);

  const syncFromCountryHint = React.useCallback(
    (countryOrLocation?: string | null) => {
      if (hasExplicitUserSelection || !countryOrLocation) return;
      const detected = detectCurrencyFromCountryOrLocale(countryOrLocation);
      setCurrencyCodeState(detected);
    },
    [hasExplicitUserSelection]
  );

  const value = React.useMemo<CurrencyContextValue>(() => {
    const currencyConfig =
      LOCALE_CURRENCIES[currencyCode] ?? LOCALE_CURRENCIES.NGN;
    return {
      currencyCode,
      currencyConfig,
      exchangeRateLabel: formatExchangeRateLabel(currencyCode),
      setCurrencyCode,
      syncFromCountryHint,
      formatBudget: (raw) => formatBudgetRangeForCurrency(raw, currencyCode),
      formatUsd: (usd, includeRef = true) =>
        formatUsdInCurrency(usd, currencyCode, includeRef),
    };
  }, [currencyCode, setCurrencyCode, syncFromCountryHint]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = React.useContext(CurrencyContext);
  if (!ctx) {
    const fallbackConfig = LOCALE_CURRENCIES.NGN;
    return {
      currencyCode: "NGN",
      currencyConfig: fallbackConfig,
      exchangeRateLabel: formatExchangeRateLabel("NGN"),
      setCurrencyCode: () => {},
      syncFromCountryHint: () => {},
      formatBudget: (raw) => formatBudgetRangeForCurrency(raw, "NGN"),
      formatUsd: (usd, includeRef = true) =>
        formatUsdInCurrency(usd, "NGN", includeRef),
    };
  }
  return ctx;
}
