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
    console.log('url', url);
    const parsedUrl = new URL(url);
    console.log('parsedUrl', parsedUrl);
    // Ensure the protocol is either http: or https:
    console.log('parsedUrl.protocol', parsedUrl.protocol);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (error) {
    console.log('error', error);
    // URL constructor throws if the format is invalid
    return false;
  }
}
