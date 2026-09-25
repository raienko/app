[Docs](../../docs/index.md) › [Components](../../docs/components/index.md) › Utilities

# Platform constants

> `isWeb`, `isIOS`, `isAndroid` — one place for every platform branch.

<sub>`src/utils` · [Tests](index.test.ts)</sub>

```ts
import { isWeb, isIOS, isAndroid } from "@/utils";

if (isIOS) AccessibilityInfo.announceForAccessibility(message);
const keyboardProps = isWeb ? { tabIndex: 0, onKeyDown } : null;
```

Three constants instead of a platform comparison written out at every call site — every one of the app's platform branches goes through them (`StateView`'s iOS announcement, `Toast`'s, `Switch`'s per-platform track size, the web keyboard handling in `Slider`, `Input`'s checklist/radio-group/switch-group, `ImagePicker`'s web path).

- **Constants, not functions.** The platform can't change while the app runs, so there's nothing to re-evaluate, and `if (isWeb)` reads as a fact rather than a question.
- **They read `Platform.OS`, not `process.env.EXPO_OS`** — and the difference matters more than it looks. The env read is inlined by `babel-preset-expo` at transform time, so it collapses to a literal and its branches are dead-code-eliminated per platform: cheaper, but under Jest it is permanently `"ios"`, which makes every non-iOS branch unreachable by any test. That's how `ImagePicker`'s web behaviour was first written — shipped, with no test able to see it. `Platform.OS` costs one comparison at module load and leaves the other branches in the bundle; being able to prove platform-specific behaviour is worth more. `src/utils/index.test.ts` asserts the env read is still pinned to `"ios"` under Jest, so a change back fails there rather than silently freezing every branch.
- **A test that needs a different platform mocks `@/utils`**, not react-native's `Platform` — replacing that module breaks `expo-modules-core`, which reads `select` from it during setup. Because the values are settled at module load, that mock belongs at the top of its own test file; `image-picker`'s web behaviour is covered in `web.test.tsx` beside the native cases in `index.test.tsx` for exactly that reason.

---

[All components](../../docs/components/index.md) · [Docs index](../../docs/index.md)
