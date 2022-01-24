import { Command, Option } from "commander";
import upload from "./upload";
import download from "./download";
import collect from "./collect";
import deleteBranch from "./delete-branch";
import validate from "./validate";
import config from "./config";

class BranchNameOption extends Option {
  constructor(description: string) {
    super("-b, --branch-name [string]", description);
    this.default(config.BRANCH_NAME);
  }
}

const main = async (argv: string[]) => {
  const program = new Command();
  const version = require("../package.json").version;

  program
    .name("mollie-crowdin")
    .usage("<upload | collect | download | delete-branch | validate> [options]")
    .version(version);

  program
    .command("upload <glob>")
    .description("scan the directory for new messages and upload them")
    .addOption(
      new BranchNameOption(
        "the Crowdin branch where to sync the translations to"
      )
    )
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
    .addOption(
      new BranchNameOption(
        "the Crowdin branch from where to download the translations"
      )
    )
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
    .addOption(new BranchNameOption("the Crowdin branch to be deleted"))
    .action(async (options: { branchName: string }) => {
      await deleteBranch({
        branchName: options.branchName,
      });
    });

  program
    .command("validate <glob>")
    .description(
      "Validate if all translations keys have been translated for a set of languages"
    )
    .requiredOption(
      "-l, --language <language...>",
      'Language to validate, e.g. "nl".'
    )
    .action(async (glob: string, options) => {
      await validate(glob, options);
    });

  program.parse(argv);
};

export default main;
