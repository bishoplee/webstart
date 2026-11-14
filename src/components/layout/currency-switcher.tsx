"use client";

import * as React from "react";
import { ArrowLeftRight, Coins } from "lucide-react";
import {
  convertFromUsd,
  convertToUsd,
  CURRENCY_LIST,
  type CurrencyCode,
  formatExchangeRateLabel,
  formatLocalCurrency,
} from "@/lib/currency";
import { useCurrency } from "@/components/currency-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function CurrencySwitcher({ compact = false }: { compact?: boolean }) {
  const { currencyCode, setCurrencyCode, exchangeRateLabel } = useCurrency();

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="relative flex items-center">
        <Coins className="pointer-events-none absolute left-2.5 size-3.5 text-brand-blue" />
        <select
          aria-label="Select locale currency"
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
          title={`Active exchange rate: ${exchangeRateLabel}`}
          className="h-8 rounded-md border border-input bg-card pl-7 pr-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {CURRENCY_LIST.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.symbol}) — {c.country}
              {c.code !== "USD"
                ? ` [${formatExchangeRateLabel(c.code)}]`
                : ""}
            </option>
          ))}
        </select>
      </div>
      {!compact && currencyCode !== "USD" && (
        <Badge
          variant="outline"
          className="hidden xl:inline-flex text-[10px] font-mono"
        >
          {exchangeRateLabel}
        </Badge>
      )}
    </div>
  );
}

/**
 * Interactive locale currency & exchange converter panel shown on budget selection screens.
 */
export function CurrencyExchangeCalculator() {
  const { currencyCode, currencyConfig, setCurrencyCode, exchangeRateLabel } =
    useCurrency();
  const [usdInput, setUsdInput] = React.useState<string>("2500");

  const numericUsd = Number(usdInput) || 0;
  const convertedLocal = convertFromUsd(numericUsd, currencyCode);

  function handleLocalChange(rawLocal: string) {
    const val = Number(rawLocal.replace(/[^0-9.]/g, "")) || 0;
    const usdEq = convertToUsd(val, currencyCode);
    setUsdInput(String(Math.round(usdEq)));
  }

  return (
    <div className="rounded-xl border border-brand-blue/30 bg-brand-blue/5 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Coins className="size-4 text-brand-blue" />
          <span className="text-xs font-semibold">
            Locale Currency & Exchange Rate Converter
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" className="font-mono text-[11px]">
            {currencyConfig.country} ({currencyConfig.name}) •{" "}
            {exchangeRateLabel}
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">
            Country / Currency
          </Label>
          <select
            aria-label="Choose currency for budget"
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
            className="h-9 w-full rounded-md border border-input bg-card px-2.5 text-xs font-medium"
          >
            {CURRENCY_LIST.map((c) => (
              <option key={c.code} value={c.code}>
                {c.country} — {c.name} ({c.symbol}) [{formatExchangeRateLabel(c.code)}]
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">
            Amount in USD ($)
          </Label>
          <Input
            type="number"
            min={0}
            value={usdInput}
            onChange={(e) => setUsdInput(e.target.value)}
            className="h-9 text-xs font-mono"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
            <ArrowLeftRight className="size-3" /> Equivalent in{" "}
            {currencyConfig.code} ({currencyConfig.symbol})
          </Label>
          <Input
            type="text"
            value={formatLocalCurrency(convertedLocal, currencyCode)}
            onChange={(e) => handleLocalChange(e.target.value)}
            className="h-9 text-xs font-mono font-semibold"
          />
        </div>
      </div>
    </div>
  );
}
