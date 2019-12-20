import commander from 'commander';
import upload from './upload';
import download from './download';

const COMMANDS = [
  'upload',
  'download',
]

async function main(argv: string[]) {
  const version = require('../package.json').version;

  commander
    .version(version, '-v, --version')
    .usage('<command> [flags]')
    .action(command => {
      if (!COMMANDS.includes(command)) {
        commander.help()
      }
    });

  commander
    .command('upload <glob>')
    .description('scan the directory for new messages and upload them')
    .action(async (glob: string) => {
      await upload(glob);
    });

  commander
    .command('download')
    .description('download new translations from crowdin')
    .action(async () => {
      await download();
    })

  commander.parse(argv);
}

export default main;