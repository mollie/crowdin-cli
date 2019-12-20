import chalk from 'chalk';

const error = (message: string) => console.log(`${chalk.black.bgRed(` ERROR `)} ${message}`);

const success = (message: string) => console.log(`${chalk.black.bgGreen(` SUCCESS `)} ${message}`);

const info = (title: string, message: string) => console.log(`${chalk.black.bgWhite(` ${title} `)} ${message}`);

export default {
  error,
  success,
  info,
};