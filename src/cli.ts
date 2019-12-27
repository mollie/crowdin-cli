import commander from "commander";
import upload from "./upload";
import download from "./download";
import collect from "./collect";

const COMMANDS = ["upload", "download"];

async function main(argv: string[]): Promise<void> {
  const program = new commander.Command();

  const version = require("../package.json").version;

  return new Promise(resolve => {
    program
      .version(version, "-v, --version")
      .usage("<command> [flags]")
      .action(command => {
        if (!COMMANDS.includes(command)) {
          program.help();
          resolve();
        }
      });

    program
      .command("upload <glob>")
      .description("scan the directory for new messages and upload them")
      .action(async (glob: string) => {
        await collect(glob);
        await upload();
        resolve();
      });

    program
      .command("collect <glob>")
      .description(
        "scan the directory for new messages and save them to english.source.json"
      )
      .action(async (glob: string) => {
        await collect(glob);
        resolve();
      });

    program
      .command("download")
      .description("download new translations from crowdin")
      .action(async () => {
        await download();
        resolve();
      });

    program.parse(argv);
  });
}

export default main;
