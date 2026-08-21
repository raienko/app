import { forwardRef } from "react";
import type { TextInput as RNTextInputInstance } from "react-native";

import BaseInput from "../base";
import type { CommonInputProps, EmailInputTypeProps } from "../types";

type Props = Omit<EmailInputTypeProps, "type"> & CommonInputProps;

/**
 * Plain string in, string out, like TextInput — only forces the
 * email-address keyboard on top of BaseInput. autoCapitalize/autoCorrect
 * still default off via BaseInput, which is what you want for an email
 * anyway.
 */
const EmailInput = forwardRef<RNTextInputInstance, Props>(function EmailInput(
  { value, onChange, ...props },
  ref,
) {
  return (
    <BaseInput
      ref={ref}
      {...props}
      value={value}
      onChangeText={onChange}
      keyboardType="email-address"
    />
  );
});

EmailInput.displayName = "EmailInput";

export default EmailInput;
