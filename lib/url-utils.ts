/**
 * Utility functions for URL manipulation
 */

/**
 * Converts localhost URLs to 127.0.0.1 to avoid IPv6 connection issues
 * This is needed because Next.js Image Optimization might try to connect to localhost
 * using IPv6 (::1) which can cause connection issues
 *
 * @param url - The URL to normalize
 * @returns The normalized URL with 127.0.0.1 instead of localhost
 */
export function normalizeLocalhostUrl(url: string): string {
  if (!url) return url;

  // Replace localhost with 127.0.0.1 to avoid IPv6 issues
  return url.replace(/localhost/g, "127.0.0.1");
}

/**
 * Checks if a URL is a localhost URL (either localhost or 127.0.0.1)
 * @param url - The URL to check
 * @returns True if the URL is a localhost URL
 */
export function isLocalhostUrl(url: string): boolean {
  if (!url) return false;

  return url.includes("localhost") || url.includes("127.0.0.1");
}

/**
 * Gets the base URL for API calls
 * @returns The base API URL
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
}
