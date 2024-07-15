import {
  CommonErrorResponse,
  TasksModel,
  ValidationErrorResponse,
  ResponseObject,
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

const taskLimit: number = 500;

export default async (options: CreateTasksOptions) => {
  log.info("Creating tasks...");

  let tasks: ResponseObject<TasksModel.Task>[] = [];
  try {
    for (let i = 0; tasks.length >= i * taskLimit; i++) {
      const moreTasks = await listTasks(i * taskLimit, taskLimit);
      tasks = tasks.concat(moreTasks.data);
    }
  } catch (error) {
    log.error(JSON.stringify(error));
    throw error;
  }

  await Promise.allSettled(
    tasks
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
