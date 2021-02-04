import commander from "commander";
import upload from "./upload";
import download from "./download";
import collect from "./collect";
import deleteBranch from "./delete-branch";

async function main(argv: string[]) {
  const program = new commander.Command();
  const version = require("../package.json").version;

  program
    .name("mollie-crowdin")
    .usage("<upload | collect | download | delete-branch> [options]")
    .version(version);

  program
    .command("upload <glob>")
    .description("scan the directory for new messages and upload them")
    .action(async (glob: string) => {
      await collect(glob);
      await upload();
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
    .option("--typescript", "write to TypeScript files (.ts)")
    .action(async (options: { typescript?: boolean }) => {
      await download(options?.typescript === true);
    });

  program
    .command("delete-branch")
    .description("clean up branches in Crowdin")
    .action(async () => {
      await deleteBranch();
    });

  program.parse(argv);
}

export default main;
