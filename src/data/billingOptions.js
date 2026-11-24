// Dropdown options shared by the advertiser billing pages (Create Invoice, Create Invoice Rule).
import { useEffect, useState } from "react";

// world currency list (code -> name), public and keyless
const CURRENCIES_API = "https://openexchangerates.org/api/currencies.json";

// time zones by UTC offset, added by hand
export const TIMEZONES = [
  { value: "-12:00", label: "(UTC-12:00) International Date Line West" },
  { value: "-11:00", label: "(UTC-11:00) Coordinated Universal Time-11, Samoa" },
  { value: "-10:00", label: "(UTC-10:00) Hawaii" },
  { value: "-09:30", label: "(UTC-09:30) Marquesas Islands" },
  { value: "-09:00", label: "(UTC-09:00) Alaska" },
  { value: "-08:00", label: "(UTC-08:00) Pacific Time (US & Canada)" },
  { value: "-07:00", label: "(UTC-07:00) Mountain Time (US & Canada)" },
  { value: "-06:00", label: "(UTC-06:00) Central Time (US & Canada), Mexico City" },
  { value: "-05:00", label: "(UTC-05:00) Eastern Time (US & Canada), Bogota, Lima" },
  { value: "-04:00", label: "(UTC-04:00) Atlantic Time (Canada), Caracas, Santiago" },
  { value: "-03:30", label: "(UTC-03:30) Newfoundland" },
  { value: "-03:00", label: "(UTC-03:00) Brasilia, Buenos Aires" },
  { value: "-02:00", label: "(UTC-02:00) Mid-Atlantic" },
  { value: "-01:00", label: "(UTC-01:00) Azores, Cape Verde Islands" },
  { value: "+00:00", label: "(UTC+00:00) UTC, London, Dublin, Lisbon" },
  { value: "+01:00", label: "(UTC+01:00) Berlin, Paris, Rome, Madrid, Lagos" },
  { value: "+02:00", label: "(UTC+02:00) Athens, Cairo, Johannesburg, Kyiv" },
  { value: "+03:00", label: "(UTC+03:00) Moscow, Istanbul, Riyadh, Nairobi" },
  { value: "+03:30", label: "(UTC+03:30) Tehran" },
  { value: "+04:00", label: "(UTC+04:00) Dubai, Abu Dhabi, Baku" },
  { value: "+04:30", label: "(UTC+04:30) Kabul" },
  { value: "+05:00", label: "(UTC+05:00) Karachi, Tashkent" },
  { value: "+05:30", label: "(UTC+05:30) India Standard Time, Kolkata" },
  { value: "+05:45", label: "(UTC+05:45) Kathmandu" },
  { value: "+06:00", label: "(UTC+06:00) Dhaka, Almaty" },
  { value: "+06:30", label: "(UTC+06:30) Yangon" },
  { value: "+07:00", label: "(UTC+07:00) Bangkok, Hanoi, Jakarta" },
  { value: "+08:00", label: "(UTC+08:00) Beijing, Singapore, Hong Kong, Perth" },
  { value: "+09:00", label: "(UTC+09:00) Tokyo, Seoul" },
  { value: "+09:30", label: "(UTC+09:30) Adelaide, Darwin" },
  { value: "+10:00", label: "(UTC+10:00) Sydney, Melbourne, Brisbane" },
  { value: "+11:00", label: "(UTC+11:00) Solomon Islands, New Caledonia" },
  { value: "+12:00", label: "(UTC+12:00) Auckland, Fiji" },
  { value: "+13:00", label: "(UTC+13:00) Nuku'alofa, Samoa" },
  { value: "+14:00", label: "(UTC+14:00) Kiritimati" },
];

// the browser's own currency list, used if the currency API cannot be reached
const fallbackCurrencies = () => {
  try {
    const names = new Intl.DisplayNames(["en"], { type: "currency" });
    return Intl.supportedValuesOf("currency").map((code) => ({ code, name: names.of(code) || code }));
  } catch {
    return ["USD", "EUR", "GBP", "INR", "AUD", "CAD"].map((code) => ({ code, name: code }));
  }
};

// [{ code, name }] from the global currency list
export function useCurrencies() {
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(CURRENCIES_API, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load currencies");
        return response.json();
      })
      .then((data) => {
        const list = Object.entries(data || {}).map(([code, name]) => ({ code, name }));
        setCurrencies(list.length ? list : fallbackCurrencies());
      })
      .catch((error) => {
        if (error.name !== "AbortError") setCurrencies(fallbackCurrencies());
      });
    return () => controller.abort();
  }, []);

  return currencies;
}
