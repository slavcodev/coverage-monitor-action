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

- `github_token` - The GITHUB_TOKEN secret.
- `clover_file` - Path to Clover XML file.
- `check` - Whether check the coverage thresholds.
- `comment` - Whether comment the coverage report.
- `threshold_alert` - Mark the build as unstable when coverage is less than this threshold.
- `threshold_warning` - Warning when coverage is less than this threshold.
- `status_context` - A string label to differentiate this status from the status of other systems.
- `comment_context` - A string label to differentiate the comment posted by this action.
- `comment_mode` - A mode for comments, supported: `replace`, `update` or `insert`.

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
        uses: slavcodev/coverage-monitor-action@1.0.1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          clover_file: "logs/clover.xml"
          threshold_alert: 10
          threshold_warning: 50
~~~

## Demo

See [Pull Request #1](https://github.com/slavcodev/coverage-monitor-action/pull/1)

## Contributing

We would love for you to contribute, pull requests are welcome!
Please see the [CONTRIBUTING.md][link-contributing] for more information.


## License

[MIT License][link-license]
