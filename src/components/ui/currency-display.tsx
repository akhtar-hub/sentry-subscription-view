
import { useUserCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  locale?: string;
  className?: string;
  showCurrencyCode?: boolean;
}

export function CurrencyDisplay({ 
  amount, 
  currency, 
  locale, 
  className,
  showCurrencyCode = false 
}: CurrencyDisplayProps) {
  const { formatAmount, currency: defaultCurrency } = useUserCurrency();
  
  // Use provided currency/locale or fall back to user's preferences
  const displayCurrency = currency || defaultCurrency;
  const displayLocale = locale || navigator.language || 'en-US';
  
  let formattedAmount: string;
  
  try {
    if (currency || locale) {
      // Use specific currency/locale if provided
      formattedAmount = new Intl.NumberFormat(displayLocale, {
        style: 'currency',
        currency: displayCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } else {
      // Use user's preferred formatting
      formattedAmount = formatAmount(amount);
    }
  } catch (error) {
    // Fallback formatting
    console.warn('Currency formatting failed:', error);
    formattedAmount = `$${amount.toFixed(2)}`;
  }
  
  return (
    <span className={cn("font-medium", className)}>
      {formattedAmount}
      {showCurrencyCode && currency && (
        <span className="text-xs text-muted-foreground ml-1">
          {displayCurrency}
        </span>
      )}
    </span>
  );
}
