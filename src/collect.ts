import { sync } from "mkdirp";
import config from "./config";
import log from "./utils/logging";
import prettify from "./utils/prettify";
import { extract } from "@formatjs/cli-lib";
import fg from "fast-glob";
import fs from "fs";

export default async (globPattern: string) => {
  log.info("Extracting messages");
  sync(config.INTL_DIR);

  const files = await fg.glob(globPattern);
  if (files.length === 0) {
    log.error("No files found, check your glob pattern");
    process.exit(1);
  }
  const resultAsString = await extract(files, {
    format: "crowdin",
  });
  fs.writeFileSync(config.TRANSLATIONS_FILE, resultAsString);

  await prettify(config.TRANSLATIONS_FILE);
};
