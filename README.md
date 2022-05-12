# Plugin Machine Builder Action

This is a [Github action](https://docs.github.com/en/actions) for WordPress plugins. This action will install the plugin's dependencies with npm and/ or composer if needed. It will then create a ZIP file of the neccasary files, while skipping development files such as tests or configuration files not needed in production. Optionally, it will add a comment to the PR, with a link to download the zip.

This action requires an active [PluginMachine](https://pluginmachine.com?utm_source=gh_builder_action) account. Sign up for a [14 Day Free Trial](https://pluginmachine.com/register?utm_source=gh_builder_action).

## Usage

> [Example Plugin](https://github.com/imaginarymachines/actions-test)

### Before Adding Workflow

First, you will need to copy your Plugin Machine token from the [API tokens page](https://pluginmachine.app/dashboard/api). Then [create an encrypted secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) in your Github repo called "PLUGIN_MACHINE_TOKEN", using the value you copied from the app.

### Workflow File

#### Build, Zip and Upload WordPress Plugin For Pull Requests

```yaml

name: Build and ZIP
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  make_zip:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        #Use Node 16
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      # Build, Zip and Upload Plugin
      - name: Zip Plugin
        id: pluginmachine
        uses: imaginary-machines/builder-action@main
        with:
          PLUGIN_MACHINE_TOKEN:  ${{ secrets.PLUGIN_MACHINE_TOKEN }}
          PLUGIN_DIR: ${{ github.workspace }}
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

#### Build, Zip and Upload WordPress Plugin And Comment On Pull Requests

```yaml

name: Build and ZIP
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  make_zip:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        #Use Node 16
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      # Build, Zip and Upload Plugin
      - name: Zip Plugin
        id: pluginmachine
        uses: imaginary-machines/builder-action@main
        with:
          PLUGIN_MACHINE_TOKEN:  ${{ secrets.PLUGIN_MACHINE_TOKEN }}
          PLUGIN_DIR: ${{ github.workspace }}
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
          COMMENT_PR: true
```



## Development

Install the dependencies

```bash
npm install
```

Run the tests :heavy_check_mark:

```bash
npm test
```

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos.  Packaging the action will create a packaged action in the dist folder.

Run prepare

```bash
npm run prepare
```

Since the packaged index.js is run from the dist folder.

```bash
git add dist
```

## Create a release branch

Users shouldn't consume the action from master since that would be latest code and actions can break compatibility between major versions.

Checkin to the v1 release branch

```bash
git checkout -b v1
git commit -a -m "v1 release"
```

```bash
git push origin v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
