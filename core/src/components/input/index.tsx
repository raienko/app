import {
  forwardRef,
  type ForwardedRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import type { TextInput as RNTextInputInstance } from "react-native";

import CodeInput from "./code";
import ChecklistInput from "./checklist";
import DateTimeInput from "./datetime";
import EmailInput from "./email";
import NumericInput from "./numeric";
import PasswordInput from "./password";
import PhoneInput from "./phone";
import SelectInput from "./select";
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
 * imperatively. The exception is `select`, which has no text field to
 * forward to — its value is picked in a Modal, not typed — so its ref
 * stays `null`. Same for `datetime`.
 *
 * @example <Input value={text} onChange={setText} label="Name" />
 * @example <Input type="numeric" value={age} onChange={setAge} min={0} max={120} />
 * @example <Input type="email" value={email} onChange={setEmail} />
 * @example <Input type="select" value={country} onChange={setCountry} options={COUNTRIES} />
 * @example <Input type="datetime" value={when} onChange={setWhen} mode="date" />
 * @example <Input type="password" value={password} onChange={setPassword} />
 * @example <Input type="code" value={code} onChange={setCode} onComplete={verify} />
 * @example <Input type="phone" defaultCountry="US" value={phone} onChange={setPhone} />
 * @example <Input type="checklist" value={topics} onChange={setTopics} options={options} />
 * @example <Input value={query} onChange={setQuery} leftSlot={<Icon name="search" />} />
 */
const Input = forwardRef<RNTextInputInstance, InputProps>(
  function Input(props, ref) {
    switch (props.type) {
      case "numeric":
        return renderVariant(NumericInput, props, ref);
      case "email":
        return renderVariant(EmailInput, props, ref);
      case "select":
        return renderVariant(SelectInput, props, ref);
      case "datetime":
        return renderVariant(DateTimeInput, props, ref);
      case "password":
        return renderVariant(PasswordInput, props, ref);
      case "code":
        return renderVariant(CodeInput, props, ref);
      case "checklist":
        return renderVariant(ChecklistInput, props, ref);
      case "phone":
        return renderVariant(PhoneInput, props, ref);
      default:
        return renderVariant(TextInput, props, ref);
    }
  },
);

Input.displayName = "Input";

export default Input;

// Re-exported so a call site declaring an options array (or a wrapper's
// props) can reach them through this folder's entry point, rather than
// importing from ./types directly.
export type {
  ChecklistOption,
  DateTimeMode,
  InputProps,
  PhoneCountryCode,
  SelectOption,
} from "./types";
