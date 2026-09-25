[Docs](../index.md) › Components

# Components

> Each component's guide lives next to its code, as `src/components/<name>/index.md`, beside its story and test. It is imported through its folder: `import Button from "@/components/button"`.

See them running in the [showcase app](../../src/screens/showcase/index.md) or in Storybook (`yarn storybook:web`).

**Categories:** [Actions](#actions) · [Forms & input](#forms--input) · [Feedback & status](#feedback--status) · [Navigation](#navigation) · [Overlays](#overlays) · [Layout & structure](#layout--structure) · [Lists](#lists) · [Display & identity](#display--identity) · [Media & rich content](#media--rich-content) · [Utilities](#utilities)

## Actions

Things you press to make something happen.

| Component                                                   | What it's for                                                                                                              |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [**Button**](../../src/components/button/index.md)          | The one pressable action: `primary`, `secondary` or `tertiary`, in three sizes, with loading, selected and pressed states. |
| [**BackButton**](../../src/components/back-button/index.md) | The back affordance for a screen that draws its own header, with a fallback route when there's no history.                 |
| [**Share**](../../src/components/share/index.md)            | Opens the OS share sheet, and copies to the clipboard where there isn't one.                                               |

## Forms & input

Fields, the frame around them, and controls for picking values.

| Component                                                               | What it's for                                                                                                                               |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [**Input**](../../src/components/input/index.md)                        | One field component, switched by `type`: text, textarea, numeric, email, password, code, phone, select, date/time, file, groups and ranges. |
| [**FormField**](../../src/components/form-field/index.md)               | The label, helper and error frame around any control, with a required/optional hint and a counter.                                          |
| [**Stepper**](../../src/components/stepper/index.md)                    | A number with − and + either side: quantities, party sizes, small counts.                                                                   |
| [**SegmentedControl**](../../src/components/segmented-control/index.md) | A row of mutually exclusive options, for switching between a few views or modes.                                                            |
| [**FilePicker**](../../src/components/file-picker/index.md)             | Wraps any trigger in a pressable that opens the system file browser.                                                                        |

## Feedback & status

Telling people what's happening — persistent alerts, progress, loading placeholders and timers.

| Component                                                     | What it's for                                                                                        |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [**Alert**](../../src/components/alert/index.md)              | A message that stays in the page until its cause goes away — offline, unverified email, failed save. |
| [**ProgressBar**](../../src/components/progress-bar/index.md) | How far along a task is, determinate or indeterminate.                                               |
| [**Skeleton**](../../src/components/skeleton/index.md)        | A loading placeholder drawn from your own artwork, with a travelling highlight.                      |
| [**Timer**](../../src/components/timer/index.md)              | A countdown or stopwatch, with an optional progress ring.                                            |

## Navigation

Headers, tab bars and moving between pages of content.

| Component                                                  | What it's for                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| [**Header**](../../src/components/header/index.md)         | A screen's top bar: leading slot, title or custom centre, trailing slot. |
| [**TabBar**](../../src/components/tab-bar/index.md)        | Bottom tabs for an Expo Router `Tabs` navigator, docked or floating.     |
| [**Pagination**](../../src/components/pagination/index.md) | Where am I, and take me to another page — numbered or as dots.           |

## Overlays

Content that sits above the screen — popups, bottom sheets, action sheets and fullscreen modals.

| Component                                        | What it's for                                                                          |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| [**Modal**](../../src/components/modal/index.md) | Popup, bottom sheet, action sheet or fullscreen overlay, with animated enter and exit. |

## Layout & structure

Screens, grouping and spacing primitives.

| Component                                                | What it's for                                                                    |
| -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [**Screen**](../../src/components/screen/index.md)       | The page container: fills the viewport, paints the background, pads the content. |
| [**Section**](../../src/components/section/index.md)     | A titled group — settings, a fieldset, a list with a “See all” action.           |
| [**Card**](../../src/components/card/index.md)           | A raised, outlined or filled surface for grouping content.                       |
| [**Accordion**](../../src/components/accordion/index.md) | A titled section that collapses and expands.                                     |
| [**Grid**](../../src/components/grid/index.md)           | 12-column rows and cells, with spans that change per breakpoint.                 |
| [**Divider**](../../src/components/divider/index.md)     | A hairline between rows, form sections or columns, optionally labelled.          |
| [**Spacer**](../../src/components/spacer/index.md)       | An explicit gap from the spacing scale, where a parent's `gap` can't express it. |

## Lists

Virtualised lists and the rows that go in them.

| Component                                               | What it's for                                                                          |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [**List**](../../src/components/list/index.md)          | A virtualised list (Legend List) that recycles rows instead of mounting one view each. |
| [**ListItem**](../../src/components/list-item/index.md) | One row: leading slot, title and subtitle, trailing slot.                              |

## Display & identity

Icons, images, people and labels.

| Component                                              | What it's for                                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| [**Icon**](../../src/components/icon/index.md)         | Five vector-icon families plus the app's own SVG set, themed by default.        |
| [**Image**](../../src/components/image/index.md)       | `expo-image` with a themed placeholder, a fallback on error and cache controls. |
| [**Avatar**](../../src/components/avatar/index.md)     | A person or thing as a picture, initials or icon, with an optional status dot.  |
| [**Badge**](../../src/components/badge/index.md)       | A small status marker: an unread count, a label, or a dot.                      |
| [**Tag**](../../src/components/tag/index.md)           | A short label: static, selectable as a filter, or removable.                    |
| [**Markdown**](../../src/components/markdown/index.md) | Markdown rendered as native text in the app's type scale and palette.           |

## Media & rich content

Video, audio, carousels, charts, scannable codes and embedded web pages.

| Component                                                     | What it's for                                                              |
| ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [**MediaPlayer**](../../src/components/media-player/index.md) | Video or audio with app-owned controls.                                    |
| [**Carousel**](../../src/components/carousel/index.md)        | Swipeable slides with accessible pagination.                               |
| [**Chart**](../../src/components/chart/index.md)              | Line, area and bar charts drawn on Skia, with an accessible text summary.  |
| [**Barcode**](../../src/components/barcode/index.md)          | A QR code or linear barcode, drawn as vectors.                             |
| [**WebView**](../../src/components/web-view/index.md)         | An embedded web page with a two-way event bridge and the app's typography. |

## Utilities

Declarative conditionals and platform constants.

| Component                                          | What it's for                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| [**If**](../../src/components/if/index.md)         | Render children only when a condition is true.                       |
| [**Match**](../../src/components/match/index.md)   | `switch`/`case` as JSX, for more than two outcomes.                  |
| [**Platform constants**](../../src/utils/index.md) | `isWeb`, `isIOS`, `isAndroid` — one place for every platform branch. |

## Not documented yet

These have stories, tests and showcase sections but no guide yet — the JSDoc in each `index.tsx` is the reference until one is written:

[`binary-control-row`](../../src/components/binary-control-row), [`checkbox`](../../src/components/checkbox), [`counter`](../../src/components/counter), [`expo-ui-host`](../../src/components/expo-ui-host), [`image-picker`](../../src/components/image-picker), [`locale-switcher`](../../src/components/locale-switcher), [`popup`](../../src/components/popup), [`radio-button`](../../src/components/radio-button), [`slider`](../../src/components/slider), [`spinner`](../../src/components/spinner), [`state-view`](../../src/components/state-view), [`switch`](../../src/components/switch), [`text`](../../src/components/text), [`theme-switcher`](../../src/components/theme-switcher), [`toast`](../../src/components/toast)
