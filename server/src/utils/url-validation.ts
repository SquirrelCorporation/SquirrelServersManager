/**
 * Checks if a given string is a valid HTTP or HTTPS URL.
 * Uses the built-in URL constructor for basic parsing validation.
 * @param url The string to validate.
 * @returns True if the string is a valid HTTP/HTTPS URL, false otherwise.
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    const parsedUrl = new URL(url);
    // Ensure the protocol is either http: or https:
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https://';
  } catch {
    // URL constructor throws if the format is invalid
    return false;
  }
}
