import { sync as globSync } from "glob";
import { sync as mkdirpSync } from "mkdirp";
import fs from "fs";
import shell from "shelljs";

import config from "./config";

import sortByKey from "./utils/sortByKey";
import log from "./utils/logging";

import { Messages, Descriptor } from "./types";

export default async (glob: string) => {
  mkdirpSync(config.INTL_DIR);

  log.info("", "Collecting messages");

  const files = globSync(glob);

  const cmd = [
    config.NODE_EXEC,
    `${config.BIN}/formatjs`,
    "extract",
    files.join(" "),
    `--messages-dir=${config.MESSAGES_DIR}`
  ];

  const { stderr } = shell.exec(cmd.join(" "));

  if (stderr) {
    log.error(stderr);
    process.exit(1);
  }

  const messages: Messages = globSync(config.MESSAGES_PATTERN)
    .map(filename => fs.readFileSync(filename, "utf8"))
    .map(file => JSON.parse(file))
    .reduce((collection, descriptors) => {
      try {
        descriptors.forEach(
          ({ id, defaultMessage, description }: Descriptor) => {
            if (collection[id] && collection[id].message !== defaultMessage) {
              log.error(`Duplicate message id: ${id}`);
              process.exit(1);
            }

            if (!defaultMessage) {
              log.error(`No default message supplied for: ${id}`);
              process.exit(1);
            }

            // Chrome JSON format
            collection[id] = { message: defaultMessage, description };
          }
        );
      } catch (error) {
        log.error(error);
        process.exit(1);
      }
      return collection;
    }, {});

  const sortedMessages = sortByKey(messages);

  log.info("", `${Object.keys(sortedMessages).length} translations found.`);

  const newTranslations = JSON.stringify(sortedMessages, null, 2);

  log.info("", "Writing new translations source file.");
  fs.writeFileSync(config.TRANSLATIONS_FILE, newTranslations);

  return;
};
