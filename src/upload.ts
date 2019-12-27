import fs from "fs";

import config from "./config";

import { createDirectory, addFile, updateFile } from "./utils/client";
import log from "./utils/logging";

export default async () => {
  log.info("", "Uploading source file to Crowdin...");

  const response = await createDirectory(config.BRANCH);

  if (!response) {
    log.error(`Something went wrong when trying to create a directory`);
    process.exit(1);
  }

  const {
    data: { success, error }
  } = response;

  if (error && error.code !== 50) {
    log.error(
      error?.message || `Something went wrong when trying to create a directory`
    );
    process.exit(1);
  }

  const fileApi = error?.code === 50 ? updateFile : addFile;

  const file = fs.createReadStream(config.TRANSLATIONS_FILE);

  if (success) {
    log.success(`Created directory: ${config.BRANCH}`);
  } else if (error?.code === 50) {
    log.info("", `Directory ${config.BRANCH} already exists`);
  }

  const { data: uploadRes } = await fileApi(config.BRANCH, file);

  if (uploadRes.error) {
    log.error(
      error?.message || "Something went wrong when uploading source.json"
    );
    process.exit(1);
  }

  log.success(`Updated source.json is uploaded to directory: ${config.BRANCH}`);

  return;
};
