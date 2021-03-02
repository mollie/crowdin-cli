import { sync } from "mkdirp";
import shell from "shelljs";
import path from "path";
import config from "./config";
import log from "./utils/logging";
import prettify from "./utils/prettify";

export default async (glob: string) => {
  log.info("Extracting messages");
  sync(config.INTL_DIR);

  const cmd = [
    process.execPath,
    path.join(process.cwd(), "node_modules", ".bin", "formatjs"),
    "extract",
    `"${glob}"`,
    "--out-file",
    config.TRANSLATIONS_FILE,
    "--format",
    "crowdin",
  ];

  const { stderr } = shell.exec(cmd.join(" "));

  if (stderr) {
    log.error(stderr);
    process.exit(1);
  }

  prettify(config.TRANSLATIONS_FILE);
};
