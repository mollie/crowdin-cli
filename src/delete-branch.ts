import {
  deleteBranch,
  deleteTask,
  listBranches,
  listFiles,
  listTasks,
} from "./lib/crowdin";
import { getCrowdinBranchName } from "./utils/get-crowdin-branch-name";
import log from "./utils/logging";
import { TasksModel, ResponseObject } from "@crowdin/crowdin-api-client";

export interface DeleteBranchOptions {
  branchName: string;
  deleteTasks?: boolean;
}

const taskLimit: number = 500;

export default async ({
  branchName: gitBranchName,
  deleteTasks,
}: DeleteBranchOptions) => {
  log.info("Deleting branch from Crowdin");
  const branchName = getCrowdinBranchName(gitBranchName);
  if (branchName === "master") {
    return log.error("Cannot delete the master branch");
  }

  let branches = null;

  try {
    branches = await listBranches(branchName);
  } catch (error) {
    return log.error("Error while fetching branches from Crowdin");
  }

  if (branches?.data.length === 0) {
    return log.error(`Couldn’t find a branch with the name: "${branchName}"`);
  }

  const branchId = branches?.data[0].data.id;

  if (!branchId) {
    return log.error(`Error determining the ID for branch: "${branchName}"`);
  }

  try {
    if (deleteTasks) {
      log.info("Deleting tasks");
      const files = await listFiles(branchId);
      if (files?.data.length !== 1) {
        return log.error(`Expected 1 file, found ${files?.data.length}`);
      }

      let tasks: ResponseObject<TasksModel.Task>[] = [];
      for (let i = 0; tasks.length >= i * taskLimit; i++) {
        const moreTasks = await listTasks(i * taskLimit, taskLimit);
        tasks = tasks.concat(moreTasks.data);
      }

      await Promise.allSettled(
        tasks
          .filter(task => task.data.fileIds.includes(files.data[0].data.id))
          .map(task => {
            log.info(
              `Deleting task: ${task.data.title} - ${task.data.targetLanguageId}`
            );

            return deleteTask(task.data.id);
          })
      ).then(results =>
        results.forEach(result => {
          if (result.status === "rejected") {
            log.error(result.reason);
          }
        })
      );
    }

    await deleteBranch(branchId);
    log.success(`Deleted branch: ${branchName} (${branchId})`);
  } catch (error) {
    log.error(error as string);
  }
};
