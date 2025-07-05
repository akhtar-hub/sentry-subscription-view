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
 * Get default currency based on locale or timezone
 */
function getCurrencyFromLocation(): string {
  // First try to get currency from timezone
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('Detected timezone:', timezone);
    
    const timezoneMap: Record<string, string> = {
      // India
      'Asia/Kolkata': 'INR',
      'Asia/Calcutta': 'INR',
      // US timezones
      'America/New_York': 'USD',
      'America/Chicago': 'USD',
      'America/Denver': 'USD',
      'America/Los_Angeles': 'USD',
      'America/Phoenix': 'USD',
      // UK
      'Europe/London': 'GBP',
      // Europe (EUR)
      'Europe/Paris': 'EUR',
      'Europe/Berlin': 'EUR',
      'Europe/Rome': 'EUR',
      'Europe/Madrid': 'EUR',
      'Europe/Amsterdam': 'EUR',
      // Canada
      'America/Toronto': 'CAD',
      'America/Vancouver': 'CAD',
      // Australia
      'Australia/Sydney': 'AUD',
      'Australia/Melbourne': 'AUD',
      // Japan
      'Asia/Tokyo': 'JPY',
      // Other Asian countries
      'Asia/Singapore': 'SGD',
      'Asia/Hong_Kong': 'HKD',
      'Asia/Bangkok': 'THB',
      'Asia/Manila': 'PHP',
      'Asia/Jakarta': 'IDR',
      'Asia/Kuala_Lumpur': 'MYR',
    };
    
    if (timezoneMap[timezone]) {
      console.log('Currency from timezone:', timezoneMap[timezone]);
      return timezoneMap[timezone];
    }
  } catch (error) {
    console.warn('Failed to get timezone:', error);
  }
  
  // Fallback to locale-based detection
  const locale = navigator.language || 'en-US';
  console.log('Detected locale:', locale);
  
  const currencyMap: Record<string, string> = {
    // India locales
    'hi': 'INR',
    'hi-IN': 'INR',
    'en-IN': 'INR',
    'ta-IN': 'INR',
    'te-IN': 'INR',
    'bn-IN': 'INR',
    'gu-IN': 'INR',
    'kn-IN': 'INR',
    'ml-IN': 'INR',
    'mr-IN': 'INR',
    'pa-IN': 'INR',
    'or-IN': 'INR',
    'as-IN': 'INR',
    // US locales
    'en-US': 'USD',
    'es-US': 'USD',
    // UK locales
    'en-GB': 'GBP',
    // European locales
    'fr-FR': 'EUR',
    'de-DE': 'EUR',
    'es-ES': 'EUR',
    'it-IT': 'EUR',
    'pt-PT': 'EUR',
    'nl-NL': 'EUR',
    'pl-PL': 'EUR',
    'cs-CZ': 'EUR',
    'sk-SK': 'EUR',
    'hu-HU': 'EUR',
    'ro-RO': 'EUR',
    'bg-BG': 'EUR',
    'hr-HR': 'EUR',
    'sl-SI': 'EUR',
    'et-EE': 'EUR',
    'lv-LV': 'EUR',
    'lt-LT': 'EUR',
    'mt-MT': 'EUR',
    'fi-FI': 'EUR',
    'el-GR': 'EUR',
    // Other countries
    'pt-BR': 'BRL',
    'ja-JP': 'JPY',
    'ko-KR': 'KRW',
    'zh-CN': 'CNY',
    'zh-TW': 'TWD',
    'ru-RU': 'RUB',
    'th-TH': 'THB',
    'id-ID': 'IDR',
    'ms-MY': 'MYR',
    'en-SG': 'SGD',
    'en-AU': 'AUD',
    'en-CA': 'CAD',
    'fr-CA': 'CAD',
    'en-NZ': 'NZD',
    'en-ZA': 'ZAR',
  };

  // Try exact match first
  if (currencyMap[locale]) {
    console.log('Currency from exact locale match:', currencyMap[locale]);
    return currencyMap[locale];
  }
  
  // Try language-only match (e.g., 'hi' from 'hi-IN')
  const languageCode = locale.split('-')[0].toLowerCase();
  console.log('Language code:', languageCode);
  
  // Special handling for common languages
  if (languageCode === 'hi' || languageCode === 'ta' || languageCode === 'te' || 
      languageCode === 'bn' || languageCode === 'gu' || languageCode === 'kn' || 
      languageCode === 'ml' || languageCode === 'mr' || languageCode === 'pa' || 
      languageCode === 'or' || languageCode === 'as') {
    console.log('Indian language detected, using INR');
    return 'INR';
  }
  
  const languageMatch = Object.keys(currencyMap).find(key => 
    key.startsWith(languageCode + '-')
  );
  
  if (languageMatch) {
    console.log('Currency from language match:', currencyMap[languageMatch]);
    return currencyMap[languageMatch];
  }
  
  // Default to USD
  console.log('Using default currency: USD');
  return 'USD';
}

/**
 * Formats a number as currency based on user's locale
 */
export function formatCurrency(amount: number, options?: { locale?: string; currency?: string }): string {
  // Default to user's browser locale or fallback to detected locale
  const locale = options?.locale || navigator.language || 'en-US';
  
  // Use detected currency if not provided
  const currency = options?.currency || getCurrencyFromLocation();
  
  console.log('Formatting currency:', { amount, locale, currency });

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
 * Hook to get user's preferred currency settings
 */
export function useUserCurrency() {
  const locale = navigator.language || 'en-US';
  const currency = getCurrencyFromLocation();
  
  console.log('useUserCurrency hook:', { locale, currency });
  
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
