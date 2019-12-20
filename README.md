
# `mollie-crowdin-cli`

This CLI is used for syncing Mollie application translations with Crowdin. It uses formatjs-cli to extract the messages from the application.

```shell
Add following variables to your .env file:
CROWDIN_KEY
CROWDIN_PROJECT_NAME

Add following scripts to package.json:
"crowdin:download": "mollie-crowdin download",
"crowdin:upload": "mollie-crowdin upload '<glob directory pattern>', // i.e. mollie-crowdin upload './src/**/!(*.test).{ts,tsx}'
```