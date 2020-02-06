
# `@mollie/crowdin-cli`

This CLI is used for syncing application translations with Crowdin. It uses `formatjs-cli` to extract the messages from the application.

## Usage
Add the following variables to your `.env` file:
```shell
CROWDIN_KEY
CROWDIN_PROJECT_NAME
CROWDIN_LANGUAGES
# i.e.
# CROWDIN_LANGUAGES=nl,en-US,fr,fr-BE
```

Add the following scripts to `package.json`:
```shell
"crowdin:download": "mollie-crowdin download",
"crowdin:upload": "mollie-crowdin upload '<glob directory pattern>'", // i.e. mollie-crowdin upload './src/**/!(*.test).{ts,tsx}'
```

## Typescript
It is possible to write the downloaded files to Typescript (.ts). To achieve that, pass the `--typescript` flag to the download command.
```shell
"crowdin:download": "mollie-crowdin download --typescript",
```
