import { Locales, Languages } from "../types";

/* Crowdin URLs use the LANGUAGES format, but we want the LOCALES one. */
const LocaleLanguageMap: { [key in Locales]: Languages } = {
  "de-DE": "de",
  "es-ES": "es-ES",
  "fr-FE": "fr",
  "fr-BE": "fr-BE",
  "nl-NL": "nl",
  "nl-BE": "nl-BE",
  "en-US": "en-US"
};

export default LocaleLanguageMap;
