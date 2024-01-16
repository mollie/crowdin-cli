import {
  CommonErrorResponse,
  ValidationErrorResponse,
} from "@crowdin/crowdin-api-client";
import {
  CrowdinType,
  createTask,
  deleteTask,
  isCommonErrorResponse,
  listBranches,
  listTasks,
  unwrapErrorResponse,
} from "./lib/crowdin";
import log from "./utils/logging";

export interface CreateTasksOptions {
  branchName: string;
  fileId: number;
  languages: string[];
  type: "proofread" | "translate";
}

export default async (options: CreateTasksOptions) => {
  log.info("Creating tasks...");

  const branches = await listBranches(options.branchName);
  const branchId = branches.data[0].data.id;
  const tasks = await listTasks({ branchId });

  await Promise.allSettled(
    tasks.data
      .filter(task => task.data.fileIds.includes(options.fileId))
      .map(task => deleteTask(task.data.id))
  );

  for await (const language of options.languages) {
    const title = `Review translations for ${options.branchName}`;
    const description = `${options.branchName} (${language})`;

    try {
      log.info(`Creating task for language ${language}: ${title}`);

      const response = await createTask(
        title,
        [options.fileId],
        language,
        options.type === "proofread"
          ? CrowdinType.PROOFREAD
          : CrowdinType.TRANSLATE,
        description
      );

      if (isCommonErrorResponse(response)) {
        log.error(response.error.message);
      }

      log.info(`Successfully created task for language ${language}`);
    } catch (errorResponse) {
      const error = unwrapErrorResponse(
        errorResponse as CommonErrorResponse | ValidationErrorResponse
      );

      log.error(error?.message);
    }
  }
};
