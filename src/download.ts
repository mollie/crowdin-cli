import { sync } from "mkdirp";
import fs from "fs";
import shell from "shelljs";
import chalk from "chalk";
import config from "./config";
import {
  updateOrRestoreFile,
  exportFile,
  isCommonErrorResponse,
} from "./lib/crowdin";
import log from "./utils/logging";
import convertToKeyValue from "./utils/convert-to-key-value";

export default async (isTS = false) => {
  // Sync source file to prevent branching issues
  if (!fs.existsSync(config.TRANSLATIONS_FILE)) {
    log.error(`${config.TRANSLATIONS_FILE} does not exist.`);
    process.exit(1);
  }

  log.info("Syncing source file");

  sync(config.TRANSLATIONS_DIR);

  const file = fs.createReadStream(config.TRANSLATIONS_FILE);
  const fileExtension = isTS ? "ts" : "js";
  const updateResponse = await updateOrRestoreFile(config.BRANCH_NAME, file);

  if (isCommonErrorResponse(updateResponse)) {
    log.error(
      updateResponse.error.message ||
        `Something went wrong while uploading the source file`
    );
    process.exit(1);
  }

  log.info("Downloading translations from Crowdin");

  const exportFileResponses = await Promise.all(
    config.CROWDIN_LANGUAGES.map(language => {
      return exportFile(config.BRANCH_NAME, language);
    })
  ).catch(data => {
    // A common error here is language codes defined in
    // `CROWDIN_LANGUAGES` that weren’t found in Crowdin.
    log.error(data.error.message);
    process.exit(1);
  });

  log.info(`Writing translations to: ${chalk.bold(config.TRANSLATIONS_DIR)}`);

  await Promise.all(
    config.CROWDIN_LANGUAGES.map((language, i) => {
      const response = exportFileResponses[i];

      if (!response || response.statusText !== "OK") {
        return;
      }

      const keyValueObject = convertToKeyValue(response.data);
      const keyValueJson = JSON.stringify(keyValueObject, null, 4);
      const destination = `${config.TRANSLATIONS_DIR}/${language}.${fileExtension}`;
      const jsData = `// Auto generated file. Do no change. Go to Crowdin to update the translations and run './node_modules/.bin/mollie-crowdin download' to update this file.\nexport default ${keyValueJson};`;

      return new Promise(resolve =>
        fs.writeFile(destination, jsData, () => resolve(true))
      );
    })
  );

  log.info("Running Prettier on downloaded files");

  shell.exec(
    [
      `${config.BIN}/prettier`,
      "--loglevel silent",
      `--write "${config.TRANSLATIONS_DIR}/*.+(${fileExtension})"`,
    ].join(" ")
  );

  log.success("Translations updated");
};
