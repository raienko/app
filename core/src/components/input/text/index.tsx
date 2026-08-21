import { forwardRef } from "react";
import type { TextInput as RNTextInputInstance } from "react-native";

import BaseInput from "../base";
import type { CommonInputProps, TextInputTypeProps } from "../types";

type Props = Omit<TextInputTypeProps, "type"> & CommonInputProps;

/**
 * Plain string in, string out — the default variation. Only adds
 * `secureTextEntry` on top of BaseInput; everything else (label, slots,
 * focus/disabled styling, the autoCapitalize/autoCorrect-off defaults) comes
 * from BaseInput.
 */
const TextInput = forwardRef<RNTextInputInstance, Props>(function TextInput(
  { value, onChange, secureTextEntry, ...props },
  ref,
) {
  return (
    <BaseInput
      ref={ref}
      {...props}
      value={value}
      onChangeText={onChange}
      secureTextEntry={secureTextEntry}
    />
  );
});

// forwardRef components have no .name (unlike a plain function component) —
// set explicitly so `describe(\`${Component.displayName} smoke test\`, ...)`
// still works the same way it does for every non-forwardRef component here.
TextInput.displayName = "TextInput";

export default TextInput;
