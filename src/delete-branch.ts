import {
  deleteBranch,
  deleteTask,
  listBranches,
  listFiles,
  listTasks,
} from "./lib/crowdin";
import { getCrowdinBranchName } from "./utils/get-crowdin-branch-name";
import log from "./utils/logging";

export interface DeleteBranchOptions {
  branchName: string;
  deleteTasks?: boolean;
}

export default async ({
  branchName: gitBranchName,
  deleteTasks,
}: DeleteBranchOptions) => {
  log.info("Deleting branch from Crowdin");
  const branchName = getCrowdinBranchName(gitBranchName);
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
      const files = await listFiles(branchId);
      const tasks = await listTasks({ branchId });

      await Promise.allSettled(
        tasks.data
          .filter(task => {
            return task.data.fileIds.some(fileId =>
              files.data.some(file => file.data.id === fileId)
            );
          })
          .map(task => deleteTask(task.data.id))
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
