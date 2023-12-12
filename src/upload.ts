import fs from "fs";
import {
  createFile,
  updateOrRestoreFile,
  createBranch,
  isCommonErrorResponse,
  unwrapErrorResponse,
  applyPreTranslations,
} from "./lib/crowdin";
import log from "./utils/logging";
import chalk from "chalk";
import {
  CommonErrorResponse,
  ValidationErrorResponse,
} from "@crowdin/crowdin-api-client";

interface UploadOptions {
  translationsFile: string;
  branchName: string;
  preTranslate?: boolean;
}

async function preTranslate(fileId: number) {
  try {
    await applyPreTranslations(fileId);
    log.success(`Successfully applied pre-translations`);
  } catch (error) {
    typeof error === "string" ? log.error(error) : console.log(error);
  }
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
        await preTranslate(fileResponse.data.id);
      }
    }
  } catch (errorResponse) {
    const error = unwrapErrorResponse(
      errorResponse as CommonErrorResponse | ValidationErrorResponse
    );

    if (error.code === "notUnique") {
      // Branch already exists. Update the file.
      log.info(`Branch ${chalk.bold(options.branchName)} already exists`);
      log.info(
        `Updating source file in branch: ${chalk.bold(options.branchName)}`
      );

      try {
        const fileResponse = await updateOrRestoreFile({
          branchName: options.branchName,
          clearTranslationsAndApprovals: options.preTranslate,
          file,
        });

        log.success("Source file updated");

        if (options.preTranslate && !isCommonErrorResponse(fileResponse)) {
          await preTranslate(fileResponse.data.id);
        }
      } catch (error) {
        typeof error === "string" ? log.error(error) : console.log(error);
      }
    } else {
      // Something else went wrong. Sometimes after a branch is
      // deleted in Crowdin, it takes a couple seconds until a new one
      // can be created. It’s probably that.
      log.error(error.code + ": " + error.message);
    }
  }
};
