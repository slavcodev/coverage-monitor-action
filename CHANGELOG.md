# Change Log
All notable changes to this project will be documented in this file
using the [Keep a CHANGELOG](http://keepachangelog.com/) principles.
This project adheres to [Semantic Versioning](http://semver.org/).

<!--
Types of changes

Added - for new features.
Changed - for changes in existing functionality.
Deprecated - for soon-to-be removed features.
Removed - for now removed features.
Fixed - for any bug fixes.
Security - in case of vulnerabilities.
-->

## [Unreleased]

_TBD_

## [1.6.0] 2022-03-07

### Added

- Added footer to comment and add a boolean option `comment_footer`, defaults to `true`.
- Expressed the support of Ukraine in this difficult time.

## [1.5.0] 2022-03-01

### Changed

- Rewrote the action using TypeScript. 

## [1.4.1] 2022-02-22

### Fixed

- Fixed using `0` in threshold config rather than using default value.
  The default value is used only when threshold option is not set.

## [1.4.0] 2022-02-21

### Deprecated

- Deprecated the option `clover_file`, replaced with `coverage_path`.

### Added

- Added `working_dir` string property, the working directory for the action. Defaults to workflow workspace.
- Allowed the action in other context, not only `pull_request`. In other word, the coverage will always be analyzed,
but the `check` and `comment` will be posted only on `pull_request`.
- Added two new options `coverage_path` and `coverage_format`.
- Added support of coverage file generated [`json-summary` Istanbul's reporter](https://istanbul.js.org/docs/advanced/alternative-reporters/#json-summary).

### Changed

- Migrated action to Node.js v16.
- Migrated from `@zeit/ncc` to `@vercel/ncc`.
- Refactored the code, split functions in smaller files.

## [1.3.1] 2022-02-20

### Fixed

- Fixed table badge to use threshold metric instead of lines rate.

### Changed

- Updated comment table to hide metric row when metric not found in coverage, instead of showing `N/A`.

## [1.3.0] 2022-02-19

### Added

- Added `threshold_metric` string property, the metric which should be considered, when calculating level.

### Changed

- Updated GitHub toolkit packages, fixed vulnerabilities alerts.
- Updated the table to include all 4 metrics.
- Updated comment table to show `N/A` if metric was not found in coverage file.

## [1.2.0] 2020-09-08

### Changed

- Updated GitHub toolkit packages, fixed vulnerabilities alerts.

## [1.1.2] 2020-09-08

### Fixed

- Hotfix to fix SHA lookup in the pull request payload.

## [1.1.1] 2020-09-08

### Fixed

- Fixed the parsing webhook payload - missing `after` key.

## [1.1.0] 2020-03-02

### Added

- Added `comment_context` string property, the label posted in comment to differentiate the comment posted by each action.
- Added `comment_mode` property to control a behaviour for posting comments to a PR. 

## [1.0.1] 2019-11-11

### Fixed

- Fixed the inputs types at which the application did not work correctly, especially for booleans.

## [1.0.0] 2019-11-11

Initial release.
