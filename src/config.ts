import shell from "shelljs";
import log from "./utils/logging";
import { Config } from "./types";
import dotenv from "dotenv";

dotenv.config();

if (
  !process.env.CROWDIN_PERSONAL_ACCESS_TOKEN ||
  !process.env.CROWDIN_PROJECT_ID ||
  !process.env.CROWDIN_LANGUAGES
) {
  log.error("Please set all required CROWDIN variables in your .env file.");
  process.exit(1);
}

const { stdout } = shell.exec("git rev-parse --abbrev-ref HEAD | tr / -", {
  silent: true,
});
const branch =
  process.env.NODE_ENV !== "test" ? stdout.replace("\n", "") : "test-branch";
const WORKING_DIR =
  process.env.NODE_ENV !== "test" ? process.cwd() : `${process.cwd()}/tests`;
const INTL_DIR = `${WORKING_DIR}/intl`;
const projectLanguages: string[] = process.env.CROWDIN_LANGUAGES.split(
  ","
) as string[];
const preTranslatedLanguages: string[] = process.env
  .CROWDIN_PRE_TRANSLATED_LANGUAGES
  ? (process.env.CROWDIN_PRE_TRANSLATED_LANGUAGES.split(",") as string[])
  : projectLanguages;

const config: Config = {
  BRANCH_NAME: branch,
  FILE_NAME: "source.json",
  CROWDIN_PERSONAL_ACCESS_TOKEN:
    process.env.CROWDIN_PERSONAL_ACCESS_TOKEN || "",
  CROWDIN_PROJECT_ID: Number(process.env.CROWDIN_PROJECT_ID),
  CROWDIN_LANGUAGES: projectLanguages,
  CROWDIN_PRE_TRANSLATED_LANGUAGES: preTranslatedLanguages,
  INTL_DIR,
  TRANSLATIONS_DIR: `${WORKING_DIR}/src/intl`,
  TRANSLATIONS_FILE: `${INTL_DIR}/english.source.json`,
  DEEPL_ENGINE_ID: 418490,
  DEEPL_SUPPORTED_LANGUAGES: [
    "nl",
    "en-GB",
    "en-US",
    "de",
    "es-ES",
    "fr",
    "it",
  ],
};

export default config;
