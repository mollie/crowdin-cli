import fs from "fs";
import {
  createFile,
  updateOrRestoreFile,
  createBranch,
  isCommonErrorResponse,
  unwrapValidationErrorResponse,
} from "./lib/crowdin";
import log from "./utils/logging";
import chalk from "chalk";

interface UploadOptions {
  translationsFile: string;
  branchName: string;
}

export default async (options: UploadOptions) => {
  log.info("Uploading source file to Crowdin");

  const file = fs.createReadStream(options.translationsFile);

  try {
    const response = await createBranch(options.branchName);

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
      log.info(`Branch ${chalk.bold(options.branchName)} already exists`);
      log.info(
        `Updating source file in branch: ${chalk.bold(options.branchName)}`
      );

      try {
        await updateOrRestoreFile(options.branchName, file);
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
