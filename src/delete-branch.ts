import { deleteBranch, deleteTask, listTasks } from "./lib/crowdin";
import log from "./utils/logging";

interface DeleteBranchOptions {
  branchName: string;
}

export default async (options: DeleteBranchOptions) => {
  log.info("Deleting branch from Crowdin");

  try {
    // Delete any open tasks for this branch
    const tasks = await listTasks();

    // Iterate over tasks and delete any where the task name includes the branch name
    for await (const task of tasks.data) {
      if (task?.data?.description?.includes(options.branchName)) {
        await deleteTask(task.data.id);
      }
    }

    await deleteBranch(options.branchName);
    log.success("Branch deleted");
  } catch (error) {
    log.error(error as string);
  }
};
