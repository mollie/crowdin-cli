import fs from "fs";
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
const gitBranchName =
  process.env.NODE_ENV !== "test" ? stdout.replace("\n", "") : "test-branch";
const PROJECT_DIR = process.cwd();
const WORKING_DIR =
  process.env.NODE_ENV !== "test" ? process.cwd() : `${process.cwd()}/tests`;
const INTL_DIR = `${WORKING_DIR}/intl`;
const projectLanguages: string[] = process.env.CROWDIN_LANGUAGES.split(
  ","
) as string[];

const config: Config = {
  BIN: `${PROJECT_DIR}/node_modules/.bin`,
  FILE_NAME: "source.json",
  CROWDIN_PERSONAL_ACCESS_TOKEN:
    process.env.CROWDIN_PERSONAL_ACCESS_TOKEN || "",
  CROWDIN_PROJECT_ID: Number(process.env.CROWDIN_PROJECT_ID),
  CROWDIN_BRANCH_NAME: process.env.CROWDIN_BRANCH_NAME || gitBranchName,
  CROWDIN_LANGUAGES: projectLanguages,
  INTL_DIR,
  NODE_EXEC: process.execPath,
  TRANSLATIONS_DIR: `${WORKING_DIR}/src/intl`,
  TRANSLATIONS_FILE: `${INTL_DIR}/english.source.json`,
};

if (!fs.existsSync(`${config.BIN}/formatjs`)) {
  log.error("@formatjs/cli executable not found in project directory");
  process.exit(1);
}

export default config;
