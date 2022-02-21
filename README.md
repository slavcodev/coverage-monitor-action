# Coverage monitor

[![Status][ico-github-actions]][link-github]
[![Latest Version][ico-version]][link-github]
[![License][ico-license]][link-license]

[ico-github-actions]: https://github.com/slavcodev/coverage-monitor-action/workflows/build/badge.svg
[ico-version]: https://img.shields.io/github/tag/slavcodev/coverage-monitor-action.svg?label=latest
[ico-license]: https://img.shields.io/badge/License-MIT-blue.svg

[link-github]: https://github.com/slavcodev/coverage-monitor-action
[link-license]: LICENSE
[link-contributing]: .github/CONTRIBUTING.md

A GitHub Action that monitor coverage.

## Usage

### Pre-requisites

Create a workflow .yml file in your repositories .github/workflows directory.
The action works only with `pull_request` event.

### Inputs


| Options | Description |
| :-- | :-- |
| `github_token` | Required. The GITHUB_TOKEN secret. |
| `clover_file` | Required. Path to Clover XML file. |
| `working_dir` | The working directory of the action. Defaults to workflow workspace. |
| `check` | Whether check the coverage thresholds. Default to `true`. |
| `comment` | Whether comment the coverage report. Default to `true`. |
| `threshold_alert` | Mark the build as unstable when coverage is less than this threshold. Default to `50`. |
| `threshold_warning` | Warning when coverage is less than this threshold. Default to `90`. |
| `threshold_metric` | A metric to check threshold on, supported: `statements`, `lines`, `methods` or `branches`. Default to `lines`. |
| `status_context` | A string label to differentiate this status from the status of other systems. Default to `Coverage Report`. |
| `comment_context` | A string label to differentiate the comment posted by this action. Default to `Coverage Report`. |
| `comment_mode` | A mode for comments, supported: `replace`, `update` or `insert`. Default to `replace`. |

### Example workflow 

~~~yaml
name: Tests
on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1

      - name: Test
        run: npm test

      - name: Monitor coverage
        uses: slavcodev/coverage-monitor-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          clover_file: "logs/clover.xml"
          threshold_alert: 10
          threshold_warning: 50
          threshold_metric: "lines"
~~~

### Permissions for the `GITHUB_TOKEN`

The secret `GITHUB_TOKEN` is granted with some permissions, and in some cases the action may fail to post the comment or the check status,
for example on `Dependabot` pull-requests. You can follow instructions from [Using the GITHUB_TOKEN in a workflow guid](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#using-the-github_token-in-a-workflow)
how to set up permissions.

You also can work around the issue with using the action with conditions, for example:

~~~yaml
name: Tests
on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Monitor coverage
        if: ! contains(github.event.pull_request.user.login, 'dependabot[bot]')
        uses: slavcodev/coverage-monitor-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          clover_file: "logs/clover.xml"
~~~

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
