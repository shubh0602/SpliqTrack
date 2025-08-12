import { db } from "../db";
import { exchangeRates } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Popular currencies with their symbols
export const SUPPORTED_CURRENCIES = {
  USD: { name: "US Dollar", symbol: "$" },
  EUR: { name: "Euro", symbol: "€" },
  GBP: { name: "British Pound", symbol: "£" },
  JPY: { name: "Japanese Yen", symbol: "¥" },
  CAD: { name: "Canadian Dollar", symbol: "C$" },
  AUD: { name: "Australian Dollar", symbol: "A$" },
  CHF: { name: "Swiss Franc", symbol: "CHF" },
  CNY: { name: "Chinese Yuan", symbol: "¥" },
  INR: { name: "Indian Rupee", symbol: "₹" },
  KRW: { name: "South Korean Won", symbol: "₩" },
  SGD: { name: "Singapore Dollar", symbol: "S$" },
  HKD: { name: "Hong Kong Dollar", symbol: "HK$" },
  NOK: { name: "Norwegian Krone", symbol: "kr" },
  SEK: { name: "Swedish Krona", symbol: "kr" },
  DKK: { name: "Danish Krone", symbol: "kr" },
  PLN: { name: "Polish Złoty", symbol: "zł" },
  CZK: { name: "Czech Koruna", symbol: "Kč" },
  HUF: { name: "Hungarian Forint", symbol: "Ft" },
  ILS: { name: "Israeli Shekel", symbol: "₪" },
  NZD: { name: "New Zealand Dollar", symbol: "NZ$" },
};

export class CurrencyService {
  private apiKey = process.env.EXCHANGE_API_KEY; // User will provide this if needed
  private baseUrl = "https://api.exchangerate-api.com/v4/latest/";

  // Get exchange rate between two currencies
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return 1;

    try {
      // First check if we have a cached rate in database
      const cachedRate = await db
        .select()
        .from(exchangeRates)
        .where(and(
          eq(exchangeRates.fromCurrency, fromCurrency),
          eq(exchangeRates.toCurrency, toCurrency)
        ))
        .limit(1);

      // If cached rate exists and is less than 1 hour old, use it
      if (cachedRate.length > 0) {
        const cacheAge = Date.now() - cachedRate[0].updatedAt!.getTime();
        if (cacheAge < 3600000) { // 1 hour in milliseconds
          return parseFloat(cachedRate[0].rate);
        }
      }

      // Fetch new rate from API
      const rate = await this.fetchExchangeRateFromAPI(fromCurrency, toCurrency);
      
      // Cache the new rate
      await this.cacheExchangeRate(fromCurrency, toCurrency, rate);
      
      return rate;
    } catch (error) {
      console.error("Error getting exchange rate:", error);
      
      // If API fails, return cached rate if available, otherwise return 1
      if (cachedRate && cachedRate.length > 0) {
        return parseFloat(cachedRate[0].rate);
      }
      return 1;
    }
  }

  private async fetchExchangeRateFromAPI(fromCurrency: string, toCurrency: string): Promise<number> {
    if (!this.apiKey) {
      // Use a fallback free API if no key provided
      const response = await fetch(`${this.baseUrl}${fromCurrency}`);
      const data = await response.json();
      return data.rates[toCurrency] || 1;
    }

    // Use ExchangeRate-API with API key for better reliability
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${this.apiKey}/pair/${fromCurrency}/${toCurrency}`
    );
    const data = await response.json();
    
    if (data.result === "success") {
      return data.conversion_rate;
    }
    
    throw new Error("Failed to fetch exchange rate");
  }

  private async cacheExchangeRate(fromCurrency: string, toCurrency: string, rate: number) {
    try {
      await db
        .insert(exchangeRates)
        .values({
          fromCurrency,
          toCurrency,
          rate: rate.toString(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [exchangeRates.fromCurrency, exchangeRates.toCurrency],
          set: {
            rate: rate.toString(),
            updatedAt: new Date(),
          },
        });
    } catch (error) {
      console.error("Error caching exchange rate:", error);
    }
  }

  // Convert amount from one currency to another
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  // Get all supported currencies
  getSupportedCurrencies() {
    return SUPPORTED_CURRENCIES;
  }

  // Format amount with currency symbol
  formatCurrency(amount: number, currency: string): string {
    const currencyInfo = SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES];
    if (!currencyInfo) return `${amount.toFixed(2)} ${currency}`;
    
    return `${currencyInfo.symbol}${amount.toFixed(2)}`;
  }

  // Calculate splits with different splitting methods
  calculateSplits(
    totalAmount: number,
    splitType: "equal" | "custom" | "percentage" | "shares",
    participants: Array<{ userId: string; amount?: number; percentage?: number; shares?: number }>
  ): Array<{ userId: string; amount: string; percentage?: string; shares?: number }> {
    const splits: Array<{ userId: string; amount: string; percentage?: string; shares?: number }> = [];

    switch (splitType) {
      case "equal":
        const equalAmount = totalAmount / participants.length;
        participants.forEach(participant => {
          splits.push({
            userId: participant.userId,
            amount: equalAmount.toFixed(2),
            percentage: (100 / participants.length).toFixed(2),
          });
        });
        break;

      case "custom":
        participants.forEach(participant => {
          const amount = participant.amount || 0;
          splits.push({
            userId: participant.userId,
            amount: amount.toFixed(2),
            percentage: ((amount / totalAmount) * 100).toFixed(2),
          });
        });
        break;

      case "percentage":
        participants.forEach(participant => {
          const percentage = participant.percentage || 0;
          const amount = (totalAmount * percentage) / 100;
          splits.push({
            userId: participant.userId,
            amount: amount.toFixed(2),
            percentage: percentage.toFixed(2),
          });
        });
        break;

      case "shares":
        const totalShares = participants.reduce((sum, p) => sum + (p.shares || 1), 0);
        participants.forEach(participant => {
          const shares = participant.shares || 1;
          const amount = (totalAmount * shares) / totalShares;
          const percentage = (shares / totalShares) * 100;
          splits.push({
            userId: participant.userId,
            amount: amount.toFixed(2),
            percentage: percentage.toFixed(2),
            shares,
          });
        });
        break;
    }

    return splits;
  }
}

export const currencyService = new CurrencyService();