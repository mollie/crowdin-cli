import {
  deleteBranch,
  deleteTask,
  listBranches,
  listTasks,
} from "./lib/crowdin";
import log from "./utils/logging";

export interface DeleteBranchOptions {
  branchName: string;
  deleteTasks?: boolean;
}

export default async ({
  branchName,
  deleteTasks = false,
}: DeleteBranchOptions) => {
  log.info("Deleting branch from Crowdin");

  try {
    if (deleteTasks) {
      const branches = await listBranches(branchName);
      const tasks = await listTasks({ branchId: branches.data[0].data.id });

      await Promise.allSettled(
        tasks.data.map(task => deleteTask(task.data.id))
      ).then(results =>
        results.forEach(result => {
          if (result.status === "rejected") {
            log.error(result.reason);
          }
        })
      );
    }

    await deleteBranch(branchName);
    log.success("Branch deleted");
  } catch (error) {
    log.error(error as string);
  }
};
