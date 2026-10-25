/** Shared cookie / ads consent flag (AdSense loads only after acknowledgment). */

export const COOKIE_CONSENT_KEY = "sello-cookie-consent-v1";
export const COOKIE_CONSENT_EVENT = "sello-cookie-consent";

export function hasCookieConsent() {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "1";
  } catch {
    return false;
  }
}

export function setCookieConsent() {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, "1");
  } catch {
    /* private mode */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
  }
}

export function subscribeCookieConsent(callback) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(COOKIE_CONSENT_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
