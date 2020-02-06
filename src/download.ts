import { sync as mkdirpSync } from "mkdirp";
import fs from "fs";
import shell from "shelljs";

import config from "./config";

import { updateFile, exportFile } from "./utils/client";
import log from "./utils/logging";
import convertToKeyValue from "./utils/convertToKeyValue";

export default async (isTS = false) => {
  /* sync source file to prevent branching issues */

  if (!fs.existsSync(config.TRANSLATIONS_FILE)) {
    log.error(`${config.TRANSLATIONS_FILE} does not exist.`);
    process.exit(1);
  }

  log.info("CROWDIN", "Starting download process...");

  mkdirpSync(config.TRANSLATIONS_DIR);

  const file = fs.createReadStream(config.TRANSLATIONS_FILE);
  const fileExtension = isTS ? "ts" : "js";

  const updateResponse = await updateFile(config.BRANCH, file);

  log.info("", "Syncing source.json");

  if (!updateResponse?.data?.success) {
    const { error } = updateResponse.data;
    log.error(
      error?.message || "Something went wrong when uploading source.json"
    );
    process.exit(1);
  }

  log.info("", "Downloading translations...");

  const exportFileResponses = await Promise.all(
    config.CROWDIN_LANGUAGES.map(language =>
      exportFile(config.BRANCH, language)
    )
  );

  log.info("", `Writing translations to: ${config.TRANSLATIONS_DIR}`);

  await Promise.all(
    config.CROWDIN_LANGUAGES.map((language, i) => {
      const translations = exportFileResponses[i].data;
      if (translations.error) {
        return;
      }

      const keyValueObject = convertToKeyValue(translations);
      const keyValueJson = JSON.stringify(keyValueObject, null, 4);

      const destination = `${config.TRANSLATIONS_DIR}/${language}.${fileExtension}`;
      const jsData = `// Auto generated file. Do no change. Go to Crowdin to update the translations and run './node_modules/.bin/mollie-crowdin download' to update this file.\nexport default ${keyValueJson};`;
      return new Promise(resolve =>
        fs.writeFile(destination, jsData, () => resolve(true))
      );
    })
  );

  log.info("", "Running prettier");

  const prettier = `${config.BIN}/prettier`;

  shell.exec(
    [
      prettier,
      "--loglevel silent",
      `--write "${config.TRANSLATIONS_DIR}/*.+(${fileExtension})"`
    ].join(" ")
  );

  log.success("Updated translations 🎉");
};
