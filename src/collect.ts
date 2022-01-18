import { sync } from "mkdirp";
import config from "./config";
import log from "./utils/logging";
import findjs from "./utils/findjs";
import prettify from "./utils/prettify";

export default async (glob: string) => {
  log.info("Extracting messages");
  sync(config.INTL_DIR);

  try {
    await findjs(glob, config.TRANSLATIONS_FILE);
  } catch (error) {
    // @TODO: the error we get from findjs should be a string
    log.error("Error: findjs could not get messages");
    process.exit(1);
  }

  prettify(config.TRANSLATIONS_FILE);
};
