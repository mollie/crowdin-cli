import fs from 'fs';
import shell from 'shelljs';

require('dotenv').config();

if (!process.env.CROWDIN_KEY) {
  console.log('You do not have the Crowdin API key, please update your .env file');
  process.exit(1);
}

if (!process.env.CROWDIN_PROJECT_NAME) {
  console.log('You do not have the Crowdin Project name set, please update your .env file');
  process.exit(1);
}

const { stdout } = shell.exec('git rev-parse --abbrev-ref HEAD | tr / -', { silent: true });
const branch = stdout.replace('\n', '');

export type Locales = 'de-DE' | 'es-ES' | 'fr-FE' | 'fr-BE' | 'nl-NL' | 'nl-BE' | 'en-US';
export type Languages = 'de' | 'es-ES' | 'fr' | 'fr-BE' | 'nl' | 'nl-BE' | 'en-US';

/* Crowdin URLs use the LANGUAGES format, but we want the LOCALES one. */
// @ts-ignore
export const LocaleLanguageMap: {[key in Locales]: Languages} = {
  // 'de-DE': 'de',
  // 'es-ES': 'es-ES',
  'fr-FE': 'fr',
  // 'fr-BE': 'fr-BE',
  // 'nl-NL': 'nl',
  // 'nl-BE': 'nl-BE',
  // 'en-US': 'en-US',
};

const HOME = process.cwd();
const INTL_DIR = `${HOME}/intl`;
const MESSAGES_DIR = `${INTL_DIR}/messages`;

interface Config {
  BIN: string;
  BRANCH: string;
  CROWDIN_KEY: string;
  CROWDIN_PROJECT_NAME: string;
  HOME: string;
  INTL_DIR: string;
  MESSAGES_DIR: string;
  MESSAGES_PATTERN: string;
  NODE_EXEC: string;
  TRANSLATIONS_DIR: string;
  TRANSLATIONS_FILE: string;
}

const config: Config = {
  BIN: `${HOME}/node_modules/.bin`,
  BRANCH: branch,
  CROWDIN_KEY: process.env.CROWDIN_KEY,
  CROWDIN_PROJECT_NAME: process.env.CROWDIN_PROJECT_NAME,
  HOME,
  INTL_DIR,
  MESSAGES_DIR,
  MESSAGES_PATTERN: `${MESSAGES_DIR}/**/*.json`,
  NODE_EXEC: process.execPath,
  TRANSLATIONS_DIR: `${HOME}/src/intl`,
  TRANSLATIONS_FILE: `${INTL_DIR}/english.source.json`,
};

if (!fs.existsSync(`${config.BIN}/formatjs`)) {
  console.log('@formatjs/cli executable not found in project directory.')
  process.exit(1);
}

export default config;