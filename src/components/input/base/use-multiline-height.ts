import { useState } from "react";
import type { TextInputProps } from "react-native";

import { useTypography } from "@/features/responsive";

import type { BaseInputProps } from "./types";

/**
 * The height of a multiline field: `minLines` tall when empty, growing with
 * its text up to `maxLines`, then fixed so the field scrolls instead of
 * pushing the rest of the form off screen. Lines are measured in the
 * field's own `callout` line height.
 *
 * A single-line field gets nothing back and keeps its natural height.
 */
export default function useMultilineHeight(
  multiline: BaseInputProps["multiline"],
): {
  style: { minHeight: number; maxHeight: number; height: number } | null;
  onContentSizeChange: TextInputProps["onContentSizeChange"];
} {
  const typography = useTypography();
  const [contentHeight, setContentHeight] = useState(0);

  if (multiline === undefined) {
    return { style: null, onContentSizeChange: undefined };
  }

  const minHeight = typography.callout.lineHeight * multiline.minLines;
  const maxHeight = typography.callout.lineHeight * multiline.maxLines;

  return {
    style: {
      minHeight,
      maxHeight,
      height: Math.min(Math.max(contentHeight, minHeight), maxHeight),
    },
    onContentSizeChange: (event) =>
      setContentHeight(event.nativeEvent.contentSize.height),
  };
}
