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

// Controlled demo — Storybook args don't feed back into a controlled
// TextInput's value, so this story owns its own state. See ./text and
// ./numeric for each variation's own story set.
export function Controlled() {
  const [value, setValue] = useState("");
  return <Component label="Controlled" value={value} onChange={setValue} />;
}
