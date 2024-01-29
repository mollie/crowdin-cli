import {
  deleteBranch,
  deleteTask,
  listBranches,
  listFiles,
  listTasks,
} from "./lib/crowdin";
import log from "./utils/logging";

export interface DeleteBranchOptions {
  branchName: string;
  deleteTasks?: boolean;
}

export default async ({ branchName, deleteTasks }: DeleteBranchOptions) => {
  log.info("Deleting branch from Crowdin");

  const branches = await listBranches(branchName);

  if (branches.data.length === 0) {
    return log.info(`Couldn’t find a branch with the name: "${branchName}"`);
  }

  const branchId = branches.data[0].data.id;

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
