import fs from "fs";
import {
  createFile,
  updateOrRestoreFile,
  createBranch,
  isCommonErrorResponse,
  unwrapErrorResponse,
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
  clearOnUpdate?: boolean;
}

export default async (
  options: UploadOptions
): Promise<{
  fileId: number;
} | void> => {
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

      return {
        fileId: fileResponse.data.id,
      };
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
          clearTranslationsAndApprovals: options.clearOnUpdate,
          file,
        });

        if (isCommonErrorResponse(fileResponse)) {
          log.error(
            `${fileResponse.error.code}: ${fileResponse.error.message}`
          );

          return;
        }

        log.success("Source file updated");

        return {
          fileId: fileResponse.data.id,
        };
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
