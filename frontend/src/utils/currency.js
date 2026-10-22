/**
 * Centralized Indian Rupee (INR) currency formatting helper.
 * Formats values using en-IN locale with '₹' symbol.
 */
export function formatINR(priceInr, originalUsdPrice = null) {
  if (priceInr !== undefined && priceInr !== null && !isNaN(priceInr) && priceInr > 0) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(priceInr);
  }

  // If priceInr is not directly present, convert from original USD price
  if (originalUsdPrice !== undefined && originalUsdPrice !== null && !isNaN(originalUsdPrice) && originalUsdPrice > 0) {
    const calculatedInr = Math.round((originalUsdPrice * 83.5) / 50) * 50 - 1;
    const finalInr = Math.max(calculatedInr, 299);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(finalInr);
  }

  return '₹1,499';
}