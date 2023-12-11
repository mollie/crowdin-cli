import { Command, Option, InvalidOptionArgumentError } from "commander";
import upload from "./upload";
import download from "./download";
import collect from "./collect";
import deleteBranch from "./delete-branch";
import config from "./config";
import createTasks, { TaskType } from "./create-tasks";

class BranchNameOption extends Option {
  constructor(description: string) {
    super("-b, --branch-name [string]", description);
    this.default(config.BRANCH_NAME);
  }
}

const parseIntArgument = (value: string) => {
  const parsedValue = parseInt(value, 10);

  if (isNaN(parsedValue)) {
    throw new InvalidOptionArgumentError("Not a number.");
  }

  return parsedValue;
};

class PreTranslateOption extends Option {
  constructor(description: string) {
    super("-b, --pre-translate", description);
    this.default(false);
  }
}

const main = async (argv: string[]) => {
  const program = new Command();
  const version = require("../package.json").version;

  program
    .name("mollie-crowdin")
    .usage(
      "<upload | collect | download | delete-branch | pre-translate> [options]"
    )
    .version(version);

  program
    .command("upload <glob>")
    .description("scan the directory for new messages and upload them")
    .addOption(
      new BranchNameOption(
        "the Crowdin branch where to sync the translations to"
      )
    )
    .addOption(
      new PreTranslateOption(
        "whether to generate pre-translations for the uploaded files"
      )
    )
    .action(
      async (
        glob: string,
        options: { branchName: string; preTranslate: boolean }
      ) => {
        await collect(glob);
        await upload({
          translationsFile: config.TRANSLATIONS_FILE,
          branchName: options.branchName,
          preTranslate: options.preTranslate,
        });
      }
    );

  program
    .command("create-tasks")
    .description(
      "create tasks for reviewing the pre-translations of this branch"
    )
    .addOption(
      new BranchNameOption(
        "the Crowdin branch for which to create tasks"
      ).makeOptionMandatory(true)
    )
    .addOption(
      new Option(
        "-f, --file-id <number>",
        "file ID for which to create the tasks"
      ).makeOptionMandatory(true)
    )
    .addOption(
      new Option("-t, --type <type>", "type of tasks to create")
        .choices(["proofread", "translate"])
        .default("proofread")
    )
    .action(
      (options: { branchName: string; fileId: string; type: TaskType }) => {
        createTasks({
          ...options,
          fileId: parseIntArgument(options.fileId),
          languages: config.CROWDIN_PRE_TRANSLATED_LANGUAGES,
        });
      }
    );

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

  await program.parseAsync(argv);
};

export default main;
