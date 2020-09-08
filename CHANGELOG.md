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
