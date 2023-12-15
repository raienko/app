fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

### android

```sh
[bundle exec] fastlane android
```

prepare, build and deploy Android

### ios

```sh
[bundle exec] fastlane ios
```

prepare, build and deploy iOS

### deploy

```sh
[bundle exec] fastlane deploy
```

prepare, build and deploy both

### setBuildNumber

```sh
[bundle exec] fastlane setBuildNumber
```

Set BUILD number        0.0.0(X)

### incrementBuildNumber

```sh
[bundle exec] fastlane incrementBuildNumber
```

Increment BUILD number  0.0.0(X)

### incrementPatchVersion

```sh
[bundle exec] fastlane incrementPatchVersion
```

Increment PATCH version 0.0.X(0)

### incrementMinorVersion

```sh
[bundle exec] fastlane incrementMinorVersion
```

Increment MINOR version 0.X.0(0)

### incrementMajorVersion

```sh
[bundle exec] fastlane incrementMajorVersion
```

Increment MAJOR version X.0.0(0)

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
