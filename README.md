
# `mollie-crowdin-cli`

This CLI written in TypeScript is used for syncing Mollie application translations with Crowdin. It uses formatjs-cli to extract the messages from the application.

Add following variables to your .env file:
```shell
CROWDIN_KEY
CROWDIN_PROJECT_NAME
```

```shell
Add following scripts to package.json:
"crowdin:download": "mollie-crowdin download",
"crowdin:upload": "mollie-crowdin upload '<glob directory pattern>', // i.e. mollie-crowdin upload './src/**/!(*.test).{ts,tsx}'
```
