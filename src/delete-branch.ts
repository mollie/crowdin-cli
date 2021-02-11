import config from "./config";
import { deleteBranch } from "./lib/crowdin";
import log from "./utils/logging";

export default async () => {
  log.info("Deleting branch from Crowdin");

  try {
    await deleteBranch(config.BRANCH_NAME);
    log.success("Branch deleted");
  } catch (error) {
    log.error(error);
  }
};
