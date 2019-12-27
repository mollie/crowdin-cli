import fs from "fs";
import shell from "shelljs";

import log from "./utils/logging";

import { Config } from "./types";

if (!process.env.CROWDIN_KEY || !process.env.CROWDIN_PROJECT_NAME) {
  log.error("Please set your Crowdin key and project name in your .env file.");
  process.exit(1);
}

const { stdout } = shell.exec("git rev-parse --abbrev-ref HEAD | tr / -", {
  silent: true
});
const branch =
  process.env.NODE_ENV !== "test" ? stdout.replace("\n", "") : "test-branch";

const PROJECT_DIR = process.cwd();

const WORKING_DIR =
  process.env.NODE_ENV !== "test" ? process.cwd() : `${process.cwd()}/tests`;

const INTL_DIR = `${WORKING_DIR}/intl`;
const MESSAGES_DIR = `${WORKING_DIR}/messages`;

const config: Config = {
  BIN: `${PROJECT_DIR}/node_modules/.bin`,
  BRANCH: branch,
  CROWDIN_KEY: process.env.CROWDIN_KEY || "",
  CROWDIN_PROJECT_NAME: process.env.CROWDIN_PROJECT_NAME || "",
  INTL_DIR,
  MESSAGES_DIR,
  MESSAGES_PATTERN: `${MESSAGES_DIR}/**/*.json`,
  NODE_EXEC: process.execPath,
  TRANSLATIONS_DIR: `${WORKING_DIR}/src/intl`,
  TRANSLATIONS_FILE: `${INTL_DIR}/english.source.json`
};

if (!fs.existsSync(`${config.BIN}/formatjs`)) {
  log.error("@formatjs/cli executable not found in project directory.");
  process.exit(1);
}

export default config;
