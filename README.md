# Coverage monitor

[![Status][ico-github-actions]][link-github]
[![Latest Version][ico-version]][link-github]
[![License][ico-license]][link-license]
[![License][ico-stand-with-ukraine]][link-stand-with-ukraine]

[ico-github-actions]: https://github.com/slavcodev/coverage-monitor-action/workflows/build/badge.svg
[ico-version]: https://img.shields.io/github/tag/slavcodev/coverage-monitor-action.svg?label=latest
[ico-license]: https://img.shields.io/badge/License-MIT-blue.svg
[ico-stand-with-ukraine]: https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg

[link-github]: https://github.com/slavcodev/coverage-monitor-action
[link-license]: LICENSE
[link-contributing]: .github/CONTRIBUTING.md
[link-stand-with-ukraine]: https://github.com/vshymanskyy/StandWithUkraine/blob/main/docs/README.md

A GitHub Action that monitor coverage.

## Usage

### Pre-requisites

Create a workflow `.yml` file in your repositories `.github/workflows` directory.

### Inputs


| Options | Description |
| :-- | :-- |
| `github_token` | **Required.** The GITHUB_TOKEN secret. |
| `coverage_path` | **Required.** Path to coverage reports. |
| `coverage_format` | Format of coverage, supported: `auto`, `clover` and `json-summary`. Defaults to `auto`. |
| `working_dir` | The working directory of the action. Defaults to workflow workspace. |
| `clover_file` | **Deprecated.** Path to Clover XML file. Prefer `coverage_path` instead of `clover_file`. |
| `threshold_alert` | Mark the build as unstable when coverage is less than this threshold. Defaults to `50`. |
| `threshold_warning` | Warning when coverage is less than this threshold. Defaults to `90`. |
| `threshold_metric` | A metric to check threshold on, supported: `statements`, `lines`, `methods` or `branches`. Defaults to `lines`. |
| `check` | Whether check the coverage thresholds. Default to `true`. Ignored when event does not support checks, is not `pull_request`. |
| `status_context` | A string label to differentiate this status from the status of other systems. Defaults to `Coverage Report`. |
| `comment` | Whether comment the coverage report. Default to `true`. Ignored when event does not support comments, is not `pull_request`. |
| `comment_context` | A string label to differentiate the comment posted by this action. Defaults to `Coverage Report`. |
| `comment_mode` | A mode for comments, supported: `replace`, `update` or `insert`. Defaults to `replace`. |
| `comment_footer` | Whether comment may contain footer. Defaults to `true`.

### Example workflow 

~~~yaml
name: Tests
on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    permissions:
        contents: read
        pull-requests: write
        statuses: write

    steps:
      - uses: actions/checkout@v4

      - name: Test
        run: npm test

      - name: Monitor coverage
        uses: slavcodev/coverage-monitor-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          coverage_path: "logs/clover.xml"
          threshold_alert: 10
          threshold_warning: 50
          threshold_metric: "lines"
~~~

### Permissions for the `GITHUB_TOKEN`

The action requires access to certain resources, thus requires the secret `GITHUB_TOKEN` with certain permissions.

The minimum required permissions includes the following (without considering the other steps of your job):

~~~yaml

permissions:
    # Access to your repository.
    contents: read
    # Access to pull request. The `write` access if you the `comment` is enabled with the action, otherwise can be `read`. 
    pull-requests: write
    # Access to pull request statuses. The `write` access if you the `check` is enabled with the action, otherwise can be `read`.
    statuses: write
~~~

Refer to the documentation on settings at the following URLs:
* [Automatic Token Authentication - GitHub Docs](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#using-the-github_token-in-a-workflow)
* [Assigning Permissions to Jobs - GitHub Docs](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)
* [Permissions required for GitHub Apps - GitHub Docs](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps)

## Preview

[![Screenshot][img-screenshot-dark]][link-example-pr]
[![Screenshot][img-screenshot-light]][link-example-pr]

[img-screenshot-dark]: screenshot.png#gh-dark-mode-only
[img-screenshot-light]: screenshot-light.png#gh-light-mode-only
[link-example-pr]: https://github.com/slavcodev/coverage-monitor-action/pull/1

## Contributing

We would love for you to contribute, pull requests are welcome!
Please see the [CONTRIBUTING.md][link-contributing] for more information.


## License

[MIT License][link-license]
