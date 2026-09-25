[← Project README](../README.md)

# Documentation

> The guides that span more than one folder, and the catalogues that lead into the rest. Anything about a single component, feature or screen lives in that folder as `index.md`, next to its code.

## Guides

| Guide                                     | What you'll find                                                                                                     |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [**Getting started**](getting-started.md) | Install, `.env` setup, running on web / iOS / Android, every script, Storybook and git hooks                         |
| [**Architecture**](architecture.md)       | Repository layout, the one-folder-per-unit rule, custom vs `@expo/ui` implementations, and where documentation lives |

## Catalogues

| Catalogue                             | What it covers                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [**Features**](features/index.md)     | The foundations every screen uses — theme, responsive, localization, accessibility — and app services such as storage and deep links |
| [**Components**](components/index.md) | Every component by category, with a one-line summary and a link to its guide                                                         |

## Also in the code

| Guide                                                    | What it covers                                                         |
| -------------------------------------------------------- | ---------------------------------------------------------------------- |
| [**Root & Providers**](../src/root/index.md)             | The provider tree around every screen, shared with tests and Storybook |
| [**The showcase app**](../src/screens/showcase/index.md) | What each section of the running app demonstrates                      |
| [**Platform constants**](../src/utils/index.md)          | `isWeb`, `isIOS`, `isAndroid`                                          |

## Conventions

- Paths are relative to the repository root (`src/components/button`); imports use the `@/` alias (`@/components/button`).
- Every folder guide opens with a breadcrumb back to its catalogue.
- "Verified live" notes record behaviour checked in the running app, not just in tests.
- Plans and open work live in the [Roadmap](../Roadmap.md), not here.
