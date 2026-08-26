import { useState } from "react";

import Component from "./index";

const meta = {
  title: "components/Input",
  component: Component,
};

export default meta;

export const Text = {
  args: {
    label: "Name",
    placeholder: "Ada Lovelace",
  },
};

export const Numeric = {
  args: {
    type: "numeric",
    label: "Age",
    placeholder: "0",
    min: 0,
    max: 120,
  },
};

// `select` has no uncontrolled form to demo through args at all — its value
// only ever changes by picking one of `options` — so it owns state here too.
export function Select() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Component
      type="select"
      label="Country"
      placeholder="Pick a country"
      value={value}
      onChange={setValue}
      options={[
        { value: "uk", label: "United Kingdom" },
        { value: "ua", label: "Ukraine" },
        { value: "jp", label: "Japan" },
      ]}
    />
  );
}

// Controlled demo — Storybook args don't feed back into a controlled
// TextInput's value, so this story owns its own state. See ./text and
// ./numeric for each variation's own story set.
export function Controlled() {
  const [value, setValue] = useState("");
  return <Component label="Controlled" value={value} onChange={setValue} />;
}
