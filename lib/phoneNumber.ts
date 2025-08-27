export type PhoneNumberParseResult =
  | { success: true; phoneNumber: PhoneNumber }
  | { success: false; error: string };

export type PhoneNumber = {
  countryCode: string;
  nationalNumber: string;
  extension?: string;
  formatted: string;
};

/**
 * Parses a string into a phone number.
 * Returns a result type that either contains a valid phone number or an error.
 */
export function parsePhoneNumber(input: string): PhoneNumberParseResult {
  // Remove all non-digit characters except + and x (for extensions)
  const cleaned = input.replace(/[^\d+x+]/gi, '');

  // Check if input is empty or too short
  if (!cleaned || cleaned.length < 7) {
    return {
      success: false,
      error: 'Phone number must be at least 7 digits long',
    };
  }

  // Check if input is too long (international numbers can be up to 15 digits)
  if (cleaned.length > 15) {
    return {
      success: false,
      error: 'Phone number cannot exceed 15 digits',
    };
  }

  // Handle international format starting with +
  if (cleaned.startsWith('+')) {
    return parseInternationalNumber(cleaned);
  }

  // Handle extension format (e.g., "123-456-7890 x123")
  if (cleaned.toLowerCase().includes('x')) {
    return parseNumberWithExtension(cleaned);
  }

  // Handle US/Canada format (assume 10 digits, add +1)
  if (cleaned.length === 10) {
    return parseUSNumber(cleaned);
  }

  // Handle US/Canada format with country code (11 digits starting with 1)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return parseUSNumber(cleaned.slice(1));
  }

  return {
    success: false,
    error: 'Unable to parse phone number format',
  };
}

function parseInternationalNumber(input: string): PhoneNumberParseResult {
  const digits = input.replace(/\D/g, '');

  if (digits.length < 8 || digits.length > 15) {
    return {
      success: false,
      error: 'International phone number must be 8-15 digits',
    };
  }

  // Extract country code (first 1-3 digits)
  const countryCodeLength = digits.startsWith('1')
    ? 1
    : digits.startsWith('7')
      ? 1
      : digits.startsWith('8')
        ? 1
        : digits.startsWith('9')
          ? 1
          : 2;

  const countryCode = digits.slice(0, countryCodeLength);
  const nationalNumber = digits.slice(countryCodeLength);

  if (nationalNumber.length < 7) {
    return {
      success: false,
      error: 'National number too short after country code',
    };
  }

  return {
    success: true,
    phoneNumber: {
      countryCode: `+${countryCode}`,
      nationalNumber,
      formatted: formatInternationalNumber(countryCode, nationalNumber),
    },
  };
}

function parseNumberWithExtension(input: string): PhoneNumberParseResult {
  const [numberPart, extensionPart] = input.toLowerCase().split('x');

  if (!extensionPart || !numberPart) {
    return {
      success: false,
      error: 'Invalid extension format',
    };
  }

  const digits = numberPart.replace(/\D/g, '');
  const extension = extensionPart.replace(/\D/g, '');

  if (digits.length < 7 || digits.length > 15) {
    return {
      success: false,
      error: 'Phone number must be 7-15 digits',
    };
  }

  if (extension.length === 0 || extension.length > 5) {
    return {
      success: false,
      error: 'Extension must be 1-5 digits',
    };
  }

  // Parse the main number part
  const mainNumberResult = parsePhoneNumber(numberPart);
  if (!mainNumberResult.success) {
    return mainNumberResult;
  }

  return {
    success: true,
    phoneNumber: {
      ...mainNumberResult.phoneNumber,
      extension,
      formatted: `${mainNumberResult.phoneNumber.formatted} ext. ${extension}`,
    },
  };
}

function parseUSNumber(input: string): PhoneNumberParseResult {
  const digits = input.replace(/\D/g, '');

  if (digits.length !== 10) {
    return {
      success: false,
      error: 'US/Canada phone number must be exactly 10 digits',
    };
  }

  const areaCode = digits.slice(0, 3);
  const exchangeCode = digits.slice(3, 6);
  const subscriberNumber = digits.slice(6);

  // Validate area code (cannot start with 0 or 1)
  if (areaCode.startsWith('0') || areaCode.startsWith('1')) {
    return {
      success: false,
      error: 'Invalid area code',
    };
  }

  // Validate exchange code (cannot start with 0 or 1)
  if (exchangeCode.startsWith('0') || exchangeCode.startsWith('1')) {
    return {
      success: false,
      error: 'Invalid exchange code',
    };
  }

  return {
    success: true,
    phoneNumber: {
      countryCode: '+1',
      nationalNumber: digits,
      formatted: `(${areaCode}) ${exchangeCode}-${subscriberNumber}`,
    },
  };
}

function formatInternationalNumber(countryCode: string, nationalNumber: string): string {
  // Simple formatting for international numbers
  if (nationalNumber.length <= 10) {
    return `+${countryCode} ${nationalNumber}`;
  }

  // Add some spacing for longer numbers
  const chunks = [];
  for (let i = 0; i < nationalNumber.length; i += 4) {
    chunks.push(nationalNumber.slice(i, i + 4));
  }

  return `+${countryCode} ${chunks.join(' ')}`;
}

/**
 * Utility function to check if a string is a valid phone number
 * This is a convenience function that uses the parse result
 */
export function isValidPhoneNumber(input: string): boolean {
  const result = parsePhoneNumber(input);
  return result.success;
}

/**
 * Utility function to extract just the phone number if parsing succeeds
 */
export function getPhoneNumber(input: string): PhoneNumber | null {
  const result = parsePhoneNumber(input);
  return result.success ? result.phoneNumber : null;
}
