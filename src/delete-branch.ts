import { deleteBranch } from "./lib/crowdin";
import log from "./utils/logging";

interface DeleteBranchOptions {
  branchName: string;
}

export default async (options: DeleteBranchOptions) => {
  log.info("Deleting branch from Crowdin");

  try {
    await deleteBranch(options.branchName);
    log.success("Branch deleted");
  } catch (error) {
    log.error(error as string);
  }
};
