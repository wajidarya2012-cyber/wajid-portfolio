import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "ps", "fa"] as const;
export type Locale   = (typeof locales)[number];
export const rtlLocales: Locale[] = ["ps", "fa"];

export function isRTL(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Fall back to English if locale is invalid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = "en";
  }

  return {
    locale,
    messages: (await import(`../public/locales/${locale}.json`)).default,
  };
});
