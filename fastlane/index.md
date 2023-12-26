[⬅️ Back](../README.md)

# CI/CD

- for CI/CD we use [Fastlane](https://docs.fastlane.tools/getting-started/cross-platform/react-native/)
- fastlane scripts allows to: build, deploy and update apps
- we use [service accounts](#service-accounts) for security reasons

## General schema
- fastlane scripts for [Android](./Android) and [iOS](./iOS) written by devs and stays in repository
- CI/CD service should set up environment and trigger necessary scripts

Such implementation allows us to be pretty much independent:
- we can easily change CI/CD service
- most configurations in a single codebase

## Service Accounts
CI/CD service will need account to access repository, Google and Apple services, 
fetch env configs, etc.

### Android
- create service account
- add configuration file for pipeline

### Apple
- create service account
- setup environment variables
