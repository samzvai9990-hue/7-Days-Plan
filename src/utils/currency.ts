/**
 * Currency Utility for Bangladeshi Taka (BDT) and Minor Units (Paisa)
 * 1 Taka = 100 Paisa (Integer Minor Units)
 * Eliminates floating-point rounding errors in financial transactions.
 */

const BENGALI_NUMERALS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
  '.': '.',
  ',': ',',
};

/**
 * Converts English digits to Bengali digits
 */
export function toBengaliDigits(input: string | number): string {
  const str = String(input);
  return str.split('').map(ch => BENGALI_NUMERALS[ch] || ch).join('');
}

/**
 * Converts Paisa (integer) to Taka decimal string (e.g. 10500 -> "105.00")
 */
export function paisaToTakaString(paisa: number): string {
  const isNegative = paisa < 0;
  const absPaisa = Math.abs(Math.round(paisa));
  const taka = Math.floor(absPaisa / 100);
  const remainder = absPaisa % 100;
  const remainderStr = remainder.toString().padStart(2, '0');
  
  // Format with commas (South Asian numbering system: 1,00,000)
  const formattedTaka = formatSouthAsianCommas(taka);
  const result = `${formattedTaka}.${remainderStr}`;
  return isNegative ? `-${result}` : result;
}

/**
 * Converts Taka input (string or number) into integer Paisa
 */
export function takaToPaisa(takaInput: string | number): number {
  if (typeof takaInput === 'number') {
    if (isNaN(takaInput)) return 0;
    return Math.round(takaInput * 100);
  }

  // Sanitize string (remove commas, spaces, currency symbols, and convert Bengali digits if typed)
  let sanitized = takaInput
    .replace(/[,৳\s]/g, '')
    .trim();

  // Convert Bengali numerals to Western digits if present
  sanitized = sanitized.replace(/[০-৯]/g, (match) => {
    const bengaliKeys = Object.entries(BENGALI_NUMERALS).find(([_, val]) => val === match);
    return bengaliKeys ? bengaliKeys[0] : match;
  });

  const parsed = parseFloat(sanitized);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

/**
 * Formats integer Paisa into full BDT representation (e.g. ৳১,০৫০.০০ or ৳1,050.00)
 */
export function formatBDT(paisa: number, lang: 'bn' | 'en' = 'bn'): string {
  const takaStr = paisaToTakaString(paisa);
  if (lang === 'bn') {
    return `৳${toBengaliDigits(takaStr)}`;
  }
  return `৳${takaStr}`;
}

/**
 * South Asian formatting for thousands, lakhs, and crores
 */
function formatSouthAsianCommas(num: number): string {
  const str = num.toString();
  if (str.length <= 3) return str;
  
  const lastThree = str.substring(str.length - 3);
  const remaining = str.substring(0, str.length - 3);
  
  // Format remaining in pairs of 2 digits
  const paired = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${paired},${lastThree}`;
}

/**
 * Calculate applicable fee for Send Money
 * Standard rule: Up to 500 Tk free; above 500 Tk flat 5 Tk fee
 */
export function calculateSendMoneyFee(amountPaisa: number): number {
  if (amountPaisa <= 50000) { // <= 500 Tk
    return 0;
  }
  return 500; // 5 Tk = 500 paisa
}

/**
 * Calculate applicable fee for Cash Out
 * Standard MFS agent fee in Bangladesh: 1.85% (185 paisa per 10,000 paisa)
 */
export function calculateCashOutFee(amountPaisa: number): number {
  if (amountPaisa <= 0) return 0;
  return Math.round((amountPaisa * 185) / 10000);
}
