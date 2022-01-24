import { sync } from "mkdirp";
import config from "./config";
import log from "./utils/logging";
import formatjs from "./utils/formatjs";
import prettify from "./utils/prettify";

export default async (glob: string) => {
  log.info("Extracting messages");
  sync(config.INTL_DIR); // Create storage dir for transations if not exists

  try {
    await formatjs(glob, config.TRANSLATIONS_FILE);
  } catch (error) {
    log.error(`FormatJS was unable to scan the source files: ${error.message}`);
    process.exit(1);
  }

  prettify(config.TRANSLATIONS_FILE);
};
