import fs from "fs";
import fg from "fast-glob";
import log from "./logging";
import * as prettier from "prettier";

const defaultConfig: prettier.Options = {
  printWidth: 100,
  singleQuote: true,
  trailingComma: "all",
  bracketSpacing: true,
};

const prettify = async (globPattern: string) => {
  const configFilePath = await prettier.resolveConfigFile();
  const configFileContents = await prettier.resolveConfig(configFilePath || "");
  const config = configFileContents || defaultConfig;

  try {
    const files = await fg.glob(globPattern);

    for (const file of files) {
      const data = fs.readFileSync(file, "utf-8");
      try {
        const pretty = await prettier.format(data, {
          ...config,
          parser: "typescript",
        });
        fs.writeFileSync(file, pretty);
        log.success(`Prettified ${file}`);
      } catch (error) {
        log.error(`Something went wrong while prettifying the file: ${file}`);
      }
    }
  } catch {
    log.error("No files found, check your glob pattern");
    process.exit(1);
  }
};

export default prettify;
