import fs from "fs";
import {
  createFile,
  updateOrRestoreFile,
  createBranch,
  isCommonErrorResponse,
  unwrapValidationErrorResponse,
  applyPreTranslations,
} from "./lib/crowdin";
import log from "./utils/logging";
import chalk from "chalk";

interface UploadOptions {
  translationsFile: string;
  branchName: string;
  preTranslate?: boolean;
}

export default async (options: UploadOptions) => {
  log.info("Uploading source file to Crowdin");

  const file = fs.createReadStream(options.translationsFile);

  try {
    const branchResponse = await createBranch(options.branchName);

    if (isCommonErrorResponse(branchResponse)) {
      log.error(branchResponse.error.message);
    } else {
      const fileResponse = await createFile(branchResponse.data.name, file);
      log.success(`Created branch ${chalk.bold(branchResponse.data.name)}`);
      log.success(
        `Uploaded source file (id: ${
          fileResponse.data.id
        }) to branch: ${chalk.bold(branchResponse.data.name)}`
      );

      if (options.preTranslate) {
        try {
          await applyPreTranslations(fileResponse.data.id);
          log.success(`Successfully applied pre-translations`);
        } catch (error) {
          log.error(error);
        }
      }
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
      log.error(error.code + ": " + error.message);
    }
  }
};
