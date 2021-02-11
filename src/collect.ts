import { sync } from "mkdirp";
import shell from "shelljs";
import config from "./config";
import log from "./utils/logging";

export default async (glob: string) => {
  log.info("Extracting messages");
  sync(config.INTL_DIR);

  const cmd = [
    config.NODE_EXEC,
    `${config.BIN}/formatjs`,
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
};
