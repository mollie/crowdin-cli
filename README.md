# `@mollie/crowdin-cli`

This CLI is used for syncing application translations with Crowdin. It uses `@formatjs/cli` to extract the messages from the application.

## Usage

Add the following variables to your `.env` file:

```shell
CROWDIN_PERSONAL_ACCESS_TOKEN
CROWDIN_PROJECT_ID
CROWDIN_LANGUAGES
# i.e.
# CROWDIN_LANGUAGES=nl,en-US,fr,fr-BE
```

Add the following scripts to your `package.json`:

```shell
"crowdin:download": "mollie-crowdin download",
"crowdin:upload": "mollie-crowdin upload '<glob directory pattern>'", // i.e. mollie-crowdin upload './src/**/!(*.test).{ts,tsx}'
"crowdin:delete-branch": "mollie-crowdin delete-branch",
```

## TypeScript

It is possible to write the downloaded files to TypeScript (.ts). To do that, pass the `--typescript` flag to the download command.

```shell
"crowdin:download": "mollie-crowdin download --typescript",
```
