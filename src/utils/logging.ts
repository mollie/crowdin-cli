// eslint-disable-next-line no-console, @typescript-eslint/no-empty-function
const log = process.env.NODE_ENV !== "test" ? console.log : () => {};
const error = (message: string) => log(`⛔️  ${message}`);
const success = (message: string) => log(`✅  ${message}`);
const info = (message: string) => log(`ℹ️  ${message}`);

export default {
  error,
  success,
  info,
};
