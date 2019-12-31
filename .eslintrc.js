module.exports = {
  extends: ["@mollie/eslint-config-typescript"],
  rules: {
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/explicit-member-accessibility": "off",
    "@typescript-eslint/explicit-function-return-type": "off"
  },
  globals: {
    __DEV__: "readable"
  }
};
