import path from "path";
import fs from "fs";
import shell from "shelljs";
import log from "./logging";

const prettify = (glob: string) => {
  const prettierExecutable = path.join(
    process.cwd(),
    "node_modules",
    ".bin",
    "prettier"
  );

  if (fs.existsSync(prettierExecutable)) {
    log.info(`Formatting ${glob} files with Prettier`);
    shell.exec(
      [prettierExecutable, "--loglevel silent", "--write", `"${glob}"`].join(
        " "
      )
    );
  }
};

export default prettify;
