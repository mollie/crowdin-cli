import chalk from "chalk";

// eslint-disable-next-line
const log = process.env.NODE_ENV !== "test" ? console.log : () => {};

const error = (message: string) =>
  log(`${chalk.black.bgRed(` ERROR `)} ${message}`);

const success = (message: string) =>
  log(`${chalk.black.bgGreen(` SUCCESS `)} ${message}`);

const info = (title: string, message: string) =>
  log(`${chalk.black.bgWhite(` ${title} `)} ${message}`);

export default {
  error,
  success,
  info
};
