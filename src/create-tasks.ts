import {
  CommonErrorResponse,
  ValidationErrorResponse,
} from "@crowdin/crowdin-api-client";
import {
  CrowdinType,
  createTask,
  deleteTask,
  isCommonErrorResponse,
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

const generateDescription = (branchName: string, language: string) =>
  `DO NOT CHANGE: ${branchName} (${language})`;

export default async (options: CreateTasksOptions) => {
  log.info("Creating tasks...");

  const tasks = await listTasks();
  const descriptions = tasks.data.map(({ data: task }) => task.description);

  for await (const language of options.languages) {
    const title = `Review translations for ${options.branchName}`;
    const description = generateDescription(options.branchName, language);

    if (descriptions.includes(description)) {
      const task = tasks.data.find(
        ({ data }) => data.description === description
      );

      if (task?.data.id) {
        await deleteTask(task.data.id);
      }
    }

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
