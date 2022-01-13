# Crowdin CLI

A little helper to sync messages with Crowdin. It uses [`@formatjs/cli`](https://formatjs.io/docs/tooling/cli/) to extract messages from your application.

## Installation

```shell
npm install @mollie/crowdin-cli
# or
yarn add @mollie/crowdin-cli
```

## Usage

In your project, create a `.env` file and add the following environment-variables:

```shell
CROWDIN_PERSONAL_ACCESS_TOKEN={your-access-token}
CROWDIN_PROJECT_ID={your-project-id}
CROWDIN_LANGUAGES=nl,en-US,fr,fr-BE # Comma-separated list of languages
```

In your `package.json`, add these scripts:

```json
"crowdin:download": "mollie-crowdin download",
"crowdin:upload": "mollie-crowdin upload './src/**/!(*.{d,test})*.ts*'", // Adjust glob-pattern if necessary
"crowdin:delete-branch": "mollie-crowdin delete-branch"
```

## Crowdin branch name

By default, `@mollie/crowdin-cli` will create a branch in Crowdin with the same name as the currently checked out branch in Git. It is possible to override this behaviour by passing a `--branch-name` option (or `-b` ) to the `upload`, `download` and `delete-branch` commands. For example, the following command will collect and upload messages to a branch named `custom-branch-name` in Crowdin.

```shell
$ mollie-crowdin upload './src/**/!(*.{d,test})*.ts*' --branch-name custom-branch-name
```

## TypeScript

To write the downloaded messages to TypeScript (.ts) files, pass the `--typescript` flag to the `download` command.

```shell
"crowdin:download": "mollie-crowdin download --typescript"
```

## Development

Install the dependencies:

```shell
    nvm install
    yarn install
```