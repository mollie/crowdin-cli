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
      const { inferredParser } = await prettier.getFileInfo(file);
      const data = fs.readFileSync(file, "utf-8");
      try {
        const pretty = await prettier.format(data, {
          ...config,
          parser: (inferredParser as prettier.BuiltInParserName) || "babel",
        });
        fs.writeFileSync(file, pretty);
        log.success(`Prettified ${file}`);
      } catch (error) {
        log.error(`Something went wrong while prettifying the file: ${file}`);
      }
    }
  } catch (error) {
    log.error("Error while prettifying files");
    console.error(error);
    process.exit(1);
  }
};

export default prettify;
