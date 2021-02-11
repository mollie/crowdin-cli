// eslint-disable-next-line no-console
const log = process.env.NODE_ENV !== "test" ? console.log : () => null;
const error = (message: string) => log(`⛔️  ${message}`);
const success = (message: string) => log(`✅  ${message}`);
const info = (message: string) => log(`ℹ️  ${message}`);

export default {
  error,
  success,
  info,
};
