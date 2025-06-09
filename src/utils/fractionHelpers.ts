export function decimalToFraction(decimal: number): string {
  if(typeof decimal !== 'number'){
    if (typeof decimal === 'string') {
      decimal = parseFloat(decimal);
    } else {
      return '0';
    }
  }
  
  // Use epsilon for floating-point comparison
  const EPSILON = 0.0001;
  
  // Round to handle floating-point precision issues
  const rounded = Math.round(decimal * 1000) / 1000;
  
  // Check if it's effectively a whole number
  if (Math.abs(rounded - Math.round(rounded)) < EPSILON) {
    return Math.round(rounded).toString();
  }
  
  // Common cooking fractions lookup
  const commonFractions: Record<number, string> = {
    0.125: '1/8',
    0.25: '1/4',
    0.333: '1/3',
    0.375: '3/8',
    0.5: '1/2',
    0.625: '5/8',
    0.666: '2/3',
    0.667: '2/3',  // Alternative representation
    0.75: '3/4',
    0.875: '7/8'
  };
  
  // Extract whole number and fractional parts
  const wholeNumber = Math.floor(rounded);
  const fractionalPart = rounded - wholeNumber;
  
  // Round fractional part to 3 decimal places
  const roundedFractional = Math.round(fractionalPart * 1000) / 1000;
  
  // Check common fractions first
  for (const [key, value] of Object.entries(commonFractions)) {
    if (Math.abs(roundedFractional - parseFloat(key)) < EPSILON) {
      return wholeNumber > 0 ? `${wholeNumber} ${value}` : value;
    }
  }
  
  // If not a common fraction, convert to simplest fraction form
  // Limit denominator to avoid overly complex fractions
  const maxDenominator = 32;
  let bestNumerator = 0;
  let bestDenominator = 1;
  let bestError = Math.abs(fractionalPart);
  
  for (let denominator = 1; denominator <= maxDenominator; denominator++) {
    const numerator = Math.round(fractionalPart * denominator);
    const error = Math.abs(fractionalPart - numerator / denominator);
    
    if (error < bestError) {
      bestError = error;
      bestNumerator = numerator;
      bestDenominator = denominator;
      
      // If we found an exact match, stop searching
      if (error < EPSILON) break;
    }
  }
  
  // Simplify the fraction
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(bestNumerator, bestDenominator);
  bestNumerator /= divisor;
  bestDenominator /= divisor;
  
  // Build the result
  if (bestNumerator === 0) {
    return wholeNumber.toString();
  }
  
  const fractionString = `${bestNumerator}/${bestDenominator}`;
  return wholeNumber > 0 ? `${wholeNumber} ${fractionString}` : fractionString;
}
