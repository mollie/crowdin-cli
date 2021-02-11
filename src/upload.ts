import fs from "fs";
import config from "./config";
import {
  createFile,
  updateOrRestoreFile,
  createBranch,
  isCommonErrorResponse,
  unwrapValidationErrorResponse,
} from "./lib/crowdin";
import log from "./utils/logging";
import chalk from "chalk";

export default async () => {
  log.info("Uploading source file to Crowdin");

  const file = fs.createReadStream(config.TRANSLATIONS_FILE);

  try {
    const response = await createBranch(config.BRANCH_NAME);

    if (isCommonErrorResponse(response)) {
      log.error(response.error.message);
    } else {
      await createFile(response.data.name, file);
      log.success(`Created branch ${chalk.bold(response.data.name)}`);
      log.success(
        `Uploaded source file to branch: ${chalk.bold(response.data.name)}`
      );
    }
  } catch (errorResponse) {
    const error = unwrapValidationErrorResponse(errorResponse);

    if (error.code === "notUnique") {
      // Branch already exists. Update the file.
      log.info(`Branch ${chalk.bold(config.BRANCH_NAME)} already exists`);
      log.info(
        `Updating source file in branch: ${chalk.bold(config.BRANCH_NAME)}`
      );

      try {
        await updateOrRestoreFile(config.BRANCH_NAME, file);
        log.success("Source file updated");
      } catch (error) {
        log.error(error);
      }
    } else {
      // Something else went wrong. Sometimes after a branch is
      // deleted in Crowdin, it takes a couple seconds until a new one
      // can be created. It’s probably that.
      log.error(error.code);
    }
  }
};
