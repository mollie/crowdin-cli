import {
  CrowdinType,
  createTask,
  isCommonErrorResponse,
  listTasks,
  unwrapValidationErrorResponse,
} from "./lib/crowdin";
import log from "./utils/logging";

export enum TaskType {
  PROOFREAD = "proofread",
  TRANSLATE = "translate",
}

export interface CreateTasksOptions {
  branchName: string;
  fileId: number;
  languages: string[];
  type: TaskType;
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
      log.info(`Task for ${language} already exists`);

      continue;
    }

    try {
      log.info(`Creating task for language ${language}: ${title}`);

      const response = await createTask(
        title,
        [options.fileId],
        language,
        options.type === TaskType.PROOFREAD
          ? CrowdinType.PROOFREAD
          : CrowdinType.TRANSLATE,
        description
      );

      if (isCommonErrorResponse(response)) {
        log.error(response.error.message);
      }

      log.info(`Successfully created task for language ${language}`);
    } catch (errorResponse) {
      const error = unwrapValidationErrorResponse(errorResponse);

      log.error(error.message);
    }
  }
};
