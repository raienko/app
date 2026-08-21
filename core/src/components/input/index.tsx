import {
  forwardRef,
  type ForwardedRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import type { TextInput as RNTextInputInstance } from "react-native";

import EmailInput from "./email";
import NumericInput from "./numeric";
import TextInput from "./text";
import type { InputProps } from "./types";

/**
 * The single `{...props}` spread for every variation. Generic in `P` so each
 * call site below is still fully type-checked: TS infers `P` from the
 * `Component` argument, then verifies the (already-narrowed-by-`switch`)
 * `props` value actually satisfies it — unlike storing a variation component
 * in an `any`-typed variable, a mismatched pairing here is a `tsc` error.
 */
function renderVariant<P>(
  Component: ForwardRefExoticComponent<P & RefAttributes<RNTextInputInstance>>,
  props: P,
  ref: ForwardedRef<RNTextInputInstance>,
) {
  return <Component ref={ref} {...props} />;
}

/**
 * One component, branching on `type` — like <input> in HTML. Each variation
 * (Text, Numeric, Email, ...) is its own component in its own folder, built
 * on the shared BaseInput shell in ./base — Input just picks which one to
 * render.
 *
 * Add a new variation by adding its props to ./types.ts, a new folder for
 * its component (+ whatever variation-only logic it needs), and a case
 * below — nothing else about the existing variations changes.
 *
 * Forwards its ref to the underlying RN TextInput (via whichever variation
 * is rendered), so `<Input ref={...} />` can be focused/blurred
 * imperatively regardless of `type`.
 *
 * @example <Input value={text} onChange={setText} label="Name" />
 * @example <Input type="numeric" value={age} onChange={setAge} min={0} max={120} />
 * @example <Input type="email" value={email} onChange={setEmail} />
 * @example <Input value={query} onChange={setQuery} leftSlot={<Icon name="search" />} />
 */
const Input = forwardRef<RNTextInputInstance, InputProps>(
  function Input(props, ref) {
    switch (props.type) {
      case "numeric":
        return renderVariant(NumericInput, props, ref);
      case "email":
        return renderVariant(EmailInput, props, ref);
      default:
        return renderVariant(TextInput, props, ref);
    }
  },
);

Input.displayName = "Input";

export default Input;
