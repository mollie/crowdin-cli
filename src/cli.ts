import { Command, Option } from "commander";
import upload from "./upload";
import download from "./download";
import collect from "./collect";
import deleteBranch, { DeleteBranchOptions } from "./delete-branch";
import config from "./config";
import createTasks, { CreateTasksOptions } from "./create-tasks";
import preTranslate from "./pre-translate";

class BranchNameOption extends Option {
  constructor(description: string) {
    super("-b, --branch-name [string]", description);
    this.default(config.BRANCH_NAME);
  }
}

class PreTranslateOption extends Option {
  constructor(description: string) {
    super("-p, --pre-translate", description);
    this.default(false);
  }
}

class DeleteTasksOption extends Option {
  constructor(description: string) {
    super("-p, --delete-tasks", description);
    this.default(false);
  }
}

const main = async (argv: string[]) => {
  const program = new Command();
  const version = require("../package.json").version;

  program
    .name("mollie-crowdin")
    .usage("<upload | collect | download | delete-branch> [options]")
    .version(version);

  program
    .command("upload <glob>")
    .description("scan the directory for new messages and upload them")
    .addOption(
      new BranchNameOption(
        "the Crowdin branch where to sync the translations to"
      )
    )
    .addOption(new Option("-t, --create-tasks", "type of tasks to create"))
    .addOption(
      new PreTranslateOption(
        "whether to generate pre-translations for the uploaded files"
      )
    )
    .action(
      async (
        glob: string,
        options: Pick<CreateTasksOptions, "branchName" | "type"> & {
          preTranslate: boolean;
          createTasks: boolean;
        }
      ) => {
        await collect(glob);

        const result = await upload({
          translationsFile: config.TRANSLATIONS_FILE,
          branchName: options.branchName,
          clearOnUpdate: options.preTranslate,
        });

        if (!result || !result.fileId) {
          return;
        }

        if (options.preTranslate) {
          await preTranslate(result.fileId);
        }

        if (options.createTasks) {
          await createTasks({
            branchName: options.branchName,
            fileId: result.fileId,
            languages: config.CROWDIN_LANGUAGES,
            type: "proofread",
          });
        }
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
    .addOption(new DeleteTasksOption("whether to delete any associated tasks"))
    .action(async (options: DeleteBranchOptions) => {
      await deleteBranch(options);
    });

  await program.parseAsync(argv);
};

export default main;
