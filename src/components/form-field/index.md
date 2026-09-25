[Docs](../../../docs/index.md) › [Components](../../../docs/components/index.md) › Forms & input

# FormField

> The label, helper and error frame around any control, with a required/optional hint and a counter.

<sub>`src/components/form-field` · [Stories](index.stories.tsx) · [Tests](index.test.tsx)</sub>

```tsx
import FormField from "@/components/form-field";

<FormField
  label="Volume"
  necessity="optional"
  helperText="Applies to every device"
>
  <Slider
    label="Volume"
    hideLabel
    value={volume}
    onChange={setVolume}
    max={100}
  />
</FormField>;
<FormField label="Guests" error={guestsError}>
  {({ labelId, descriptionId }) => (
    <MyControl aria-labelledby={labelId} aria-describedby={descriptionId} />
  )}
</FormField>;
```

The label, helper and error shell every `Input` variation is drawn in, public so a `Slider`, a `Stepper` or anything custom sits in a form without looking borrowed.

- **It owns text and spacing only.** The control keeps its own name and state; give a control that draws its own label (`Slider`, `Stepper`) `hideLabel`, so its name stays for a screen reader without showing twice. When a control should point at the field's text instead of repeating it, pass a function as `children`: it receives `labelId` and `descriptionId`, the `nativeID`s on the label and the helper/error line, for `aria-labelledby`/`aria-describedby` on the web and `accessibilityLabelledBy` on Android.
- **An error is announced when it appears** — the error line alone is an assertive live region. Helper text is not, because a hint that talks whenever it changes is noise.
- **`necessity`** puts "Required" or "Optional" beside the label; see the note under `Input` on marking only the exception.
- **`counter` / `counterLabel`** put a short reading at the end of the helper row ("3/5", "120/500") with a spoken form ("3 of 5 selected"). The helper wraps and the counter never gets pushed off the edge.

---

[All components](../../../docs/components/index.md) · [Docs index](../../../docs/index.md)
