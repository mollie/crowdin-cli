/**
 * Get all translation keys from project //collect
 * Get all translations for languages
 * Check if every language has the translation keys from project
 */
import config from "./config";
import formatjs from "./utils/formatjs";
import log from "./utils/logging";
import fs from "fs";
import path from "path";
import * as ts from "typescript";
// import tempy from "tempy";
import chalk from "chalk";

export default async (glob: string) => {
  log.info("Collecting message keys from source files...");

  const language = "de";

  /*
   * Create a temporary file for FormatJS, this way we won't mess with the existing file which is under version control.
   */
  const temporaryFileName = "tempy.json" // tempy.file({extension: "json"});

  try {
    await formatjs(glob, temporaryFileName);
  } catch (error) {
    log.error(`FormatJS was unable to scan the source files: ${error.message}`);
    process.exit(1);
  }

  const projectMessagesJson = fs.readFileSync(temporaryFileName, "utf-8");
  fs.unlinkSync(temporaryFileName); // File is no longer needed.

  log.info(`Retrieving ${chalk.bold(language)} translations from project...`);

  const projectMessages = JSON.parse(projectMessagesJson);
  const messageKeys = Object.keys(projectMessages);

  const projectTranslations = getTranslatedMessages(language);

  // @TODO: as mvp just looping over keys to check if they exist
  // improvements; ensure keys are different
  // have the correct placeholders

  let badApples = 0;

  messageKeys.forEach(messageKey => {
    if (!(messageKey in projectTranslations)) {
      /*
       * Message is not present in the translations file.
       */
      log.error(`Missing message ${chalk.bold(messageKey)} in language ${chalk.bold(language)}.`);

      badApples++;
    } else if (projectMessages[messageKey].message == projectTranslations[messageKey])  {

      /*
       * Message is the same in the translations file as in the source file.
       */
      log.error(`Untranslated message ${chalk.bold(messageKey)} in language ${chalk.bold(language)}.`);
      badApples++;
    }
  });

  log.info(`Completed check, all ${messageKeys.length} keys are present for translation.`);
  log.info(`Found ${badApples} problems with the translations.`);

  if (badApples > 0) {
    process.exit(1);
  }
};

function getTranslatedMessages(lang: string)
{
  /*
   * Only Typescript is supported, sorry!
   */
  const translationsFile = path.join(config.TRANSLATIONS_DIR, lang + ".ts");

  const translationTypeScriptExport = fs.readFileSync(translationsFile,"utf-8");

  const transpileOutput = ts.transpileModule(translationTypeScriptExport, {
    compilerOptions: {
      removeComments: true,
      module: ts.ModuleKind.CommonJS
    }
  });

  return eval(transpileOutput.outputText);
}