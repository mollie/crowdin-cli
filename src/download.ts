import { sync } from "mkdirp";
import fs from "fs";
import chalk from "chalk";
import {
  updateOrRestoreFile,
  exportFile,
  isCommonErrorResponse,
  unwrapErrorResponse,
} from "./lib/crowdin";
import log from "./utils/logging";
import convertToKeyValue from "./utils/convert-to-key-value";
import prettify from "./utils/prettify";

interface DownloadOptions {
  translationsFile: string;
  translationsDir: string;
  branchName: string;
  languages: string[];
  typescript: boolean;
}

export default async (options: DownloadOptions) => {
  // Sync source file to prevent branching issues
  if (!fs.existsSync(options.translationsFile)) {
    log.error(`${options.translationsFile} does not exist.`);
    process.exit(1);
  }

  log.info("Syncing source file");

  sync(options.translationsDir);

  const file = fs.createReadStream(options.translationsFile);
  const fileExtension = options.typescript ? "ts" : "js";
  const updateResponse = await updateOrRestoreFile({
    branchName: options.branchName,
    file,
  });

  if (isCommonErrorResponse(updateResponse)) {
    log.error(
      updateResponse.error.message ||
        "Something went wrong while uploading the source file"
    );
    process.exit(1);
  }

  log.info("Downloading translations from Crowdin");

  const exportFileResponses = await Promise.all(
    options.languages.map(language => {
      return exportFile(options.branchName, language);
    })
  ).catch(data => {
    // A common error here is language codes defined in
    // `CROWDIN_LANGUAGES` that weren’t found in Crowdin.

    if (isCommonErrorResponse(data)) {
      log.error(data.error.message);
    }

    if (unwrapErrorResponse(data)?.code === "notInArray") {
      log.error(
        "Target language not found. Make sure `CROWDIN_LANGUAGES` is correct."
      );
    }

    process.exit(1);
  });

  log.info(`Writing translations to: ${chalk.bold(options.translationsDir)}`);

  await Promise.all(
    options.languages.map((language, i) => {
      const response = exportFileResponses[i];

      if (!response || response.statusText !== "OK") {
        return;
      }

      const keyValueObject = convertToKeyValue(response.data);
      const keyValueJson = JSON.stringify(keyValueObject, null, 4);
      const destination = `${options.translationsDir}/${language}.${fileExtension}`;
      const jsData = `// Auto generated file. Do no change. Go to Crowdin to update the translations and run './node_modules/.bin/mollie-crowdin download' to update this file.\nexport default ${keyValueJson};`;

      return new Promise(resolve =>
        fs.writeFile(destination, jsData, () => resolve(true))
      );
    })
  );

  prettify(`${options.translationsDir}/*.+(${fileExtension})`);

  log.success("Translations updated");
};
