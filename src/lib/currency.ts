
/**
 * Currency formatting utilities for displaying subscription amounts
 * in the user's local currency format
 */

interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  amount: number;
}

/**
 * Formats a number as currency based on user's locale
 */
export function formatCurrency(amount: number, options?: { locale?: string; currency?: string }): string {
  // Default to user's browser locale or fallback to US
  const locale = options?.locale || navigator.language || 'en-US';
  
  // Default currency based on locale
  const defaultCurrency = getCurrencyFromLocale(locale);
  const currency = options?.currency || defaultCurrency;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback to USD if currency/locale is not supported
    console.warn('Currency formatting failed, falling back to USD:', error);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

/**
 * Get default currency based on locale
 */
function getCurrencyFromLocale(locale: string): string {
  const currencyMap: Record<string, string> = {
    // Major currencies by locale
    'en-US': 'USD',
    'en-GB': 'GBP',
    'en-CA': 'CAD',
    'en-AU': 'AUD',
    'fr-FR': 'EUR',
    'de-DE': 'EUR',
    'es-ES': 'EUR',
    'it-IT': 'EUR',
    'pt-BR': 'BRL',
    'ja-JP': 'JPY',
    'ko-KR': 'KRW',
    'zh-CN': 'CNY',
    'zh-TW': 'TWD',
    'ru-RU': 'RUB',
    'in-IN': 'INR',
    'th-TH': 'THB',
    'id-ID': 'IDR',
    'my-MY': 'MYR',
    'sg-SG': 'SGD',
    'ph-PH': 'PHP',
    'vn-VN': 'VND',
  };

  // Extract language-country code
  const localeKey = locale.toLowerCase();
  
  // Try exact match first
  if (currencyMap[localeKey]) {
    return currencyMap[localeKey];
  }
  
  // Try language-only match (e.g., 'en' from 'en-NZ')
  const languageCode = localeKey.split('-')[0];
  const languageMatch = Object.keys(currencyMap).find(key => 
    key.startsWith(languageCode + '-')
  );
  
  if (languageMatch) {
    return currencyMap[languageMatch];
  }
  
  // Default to USD
  return 'USD';
}

/**
 * Hook to get user's preferred currency settings
 */
export function useUserCurrency() {
  const locale = navigator.language || 'en-US';
  const currency = getCurrencyFromLocale(locale);
  
  return {
    locale,
    currency,
    formatAmount: (amount: number) => formatCurrency(amount, { locale, currency }),
  };
}

/**
 * Convert amount between currencies (placeholder for future implementation)
 * For now, this just returns the original amount
 * In the future, this could integrate with exchange rate APIs
 */
export function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
): number {
  // Placeholder - in a real implementation, you'd use exchange rates
  // For now, just return the original amount
  console.log(`Currency conversion from ${fromCurrency} to ${toCurrency} not implemented yet`);
  return amount;
}
