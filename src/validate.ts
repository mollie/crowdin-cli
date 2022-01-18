/**
 * Get all translation keys from project //collect
 * Get all translations for languages
 * Check if every language has the translation keys from project
 */

import findjs from "./utils/findjs";
import log from "./utils/logging";
import fs from "fs";
import config from "./config";

// probably we need some ts parser to get typescript files in node
import tsNode from "ts-node";

export default async (glob: string) => {
  console.log("Validating messages");
  tsNode.register({});
  // @TODO: for testing purposes we created a temporary file
  const temporaryFileName = "temp.json";

  try {
    await findjs(glob, temporaryFileName);
  } catch (error) {
    // @TODO: the error we get from findjs should be a string
    log.error("Error: findjs could not get messages");
    process.exit(1);
  }

  const projectStrings = fs.readFileSync(temporaryFileName, "utf-8");
  const projectStringsJSON = JSON.parse(projectStrings);
  const { translationsMap } = require(config.TRANSLATIONS_DIR + "/de.ts");

  // @TODO: as mvp just looping over keys to check if they exist
  Object.keys(projectStringsJSON).forEach(key => {
    if (!(key in translationsMap)) {
      console.log("missing", key);
    }
  });
};
