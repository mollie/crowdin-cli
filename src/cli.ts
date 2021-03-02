import { Command, Option } from "commander";
import upload from "./upload";
import download from "./download";
import collect from "./collect";
import deleteBranch from "./delete-branch";
import config from "./config";

const main = async (argv: string[]) => {
  const program = new Command();
  const version = require("../package.json").version;
  const branchOption = new Option(
    "-b, --branch-name [string]",
    "the Crowdin branch name where to sync the translations"
  ).default(config.BRANCH_NAME);

  program
    .name("mollie-crowdin")
    .usage("<upload | collect | download | delete-branch> [options]")
    .version(version);

  program
    .command("upload <glob>")
    .description("scan the directory for new messages and upload them")
    .addOption(branchOption)
    .action(async (glob: string, options: { branchName: string }) => {
      await collect(glob);
      await upload({
        translationsFile: config.TRANSLATIONS_FILE,
        branchName: options.branchName,
      });
    });

  program
    .command("collect <glob>")
    .description(
      "scan the directory for new messages and save them to english.source.json"
    )
    .action(async (glob: string) => {
      await collect(glob);
    });

  program
    .command("download")
    .description("download new translations from Crowdin")
    .option("--typescript", "write to TypeScript files (.ts)", false)
    .addOption(branchOption)
    .action(async (options: { typescript: boolean; branchName: string }) => {
      await download({
        translationsFile: config.TRANSLATIONS_FILE,
        translationsDir: config.TRANSLATIONS_DIR,
        languages: config.CROWDIN_LANGUAGES,
        branchName: options.branchName,
        typescript: options.typescript,
      });
    });

  program
    .command("delete-branch")
    .description("clean up branches in Crowdin")
    .addOption(branchOption)
    .action(async (options: { branchName: string }) => {
      await deleteBranch({
        branchName: options.branchName,
      });
    });

  program.parse(argv);
};

export default main;
