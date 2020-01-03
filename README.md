
# `@mollie/crowdin-cli`

This CLI written in TypeScript is used for syncing plication translations with Crowdin. It uses `formatjs-cli` to extract the messages from the application.

Add following variables to your `.env` file:
```shell
CROWDIN_KEY
CROWDIN_PROJECT_NAME
```

Add the following scripts to `package.json`:
```shell
"crowdin:download": "@mollie/crowdin-cli download",
"crowdin:upload": "@mollie/crowdin-cli upload '<glob directory pattern>', // i.e. mollie-crowdin upload './src/**/!(*.test).{ts,tsx}'
```