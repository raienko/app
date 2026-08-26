import { useRef, useState } from "react";
import { View, type TextInput as RNTextInputInstance } from "react-native";

import Button from "@/components/button";
import Icon from "@/components/icon";
import Input from "@/components/input";
import { useLocale } from "@/features/localization";
import { createStyles } from "@/features/responsive";

import Readout from "./readout";

const COUNTRIES = [
  { value: "uk", label: "United Kingdom" },
  { value: "ua", label: "Ukraine" },
  { value: "es", label: "Spain" },
  { value: "jp", label: "Japan" },
  { value: "cn", label: "China" },
];

/**
 * Every input variation at once, each showing what's specific to it:
 * `text` with a label, slot and helper text; `numeric` with min/max
 * clamping and its own number keyboard; `email` with live validation
 * driving the error state; `select` picking from a list in a Modal instead
 * of being typed into. One field is disabled, and "Focus email" exercises
 * ref forwarding through the variation to the RN TextInput.
 */
export default function InputsSection() {
  const { t } = useLocale();
  const styles = useStyles();
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const emailRef = useRef<RNTextInputInstance>(null);

  const emailError =
    email && !email.includes("@") ? t("input.email.error") : undefined;

  return (
    <View style={styles.container}>
      <Input
        label={t("input.name.label")}
        placeholder={t("input.name.placeholder")}
        value={name}
        onChange={setName}
        leftSlot={<Icon name="user" />}
        helperText={t("input.name.helper")}
      />
      <Input
        type="numeric"
        label={t("input.age.label")}
        placeholder={t("input.age.placeholder")}
        value={age}
        onChange={setAge}
        min={0}
        max={120}
        leftSlot={<Icon name="hash" />}
        helperText="0–120, non-digits stripped as you type"
      />
      <Input
        ref={emailRef}
        type="email"
        label={t("input.email.label")}
        placeholder={t("input.email.placeholder")}
        value={email}
        onChange={setEmail}
        leftSlot={<Icon name="mail" />}
        error={emailError}
      />
      <Input
        label="Password"
        placeholder="••••••••"
        value={secret}
        onChange={setSecret}
        secureTextEntry
        leftSlot={<Icon name="lock" />}
      />
      <Input
        type="select"
        label="Country"
        placeholder="Pick a country"
        value={country}
        onChange={setCountry}
        options={COUNTRIES}
        leftSlot={<Icon name="globe" />}
        helperText="Opens a bottom-sheet Modal — tap the backdrop to keep the current pick"
      />
      <Input
        label="Disabled"
        placeholder="not editable"
        value=""
        onChange={() => {}}
        disabled
        leftSlot={<Icon name="slash" />}
      />

      <Button
        value={t("input.focusEmail")}
        onPress={() => emailRef.current?.focus()}
      />

      <Readout label="name" value={name || "—"} />
      <Readout label="age" value={age === null ? "—" : String(age)} />
      <Readout label="email" value={email || "—"} />
      {/* The stored value, not the label — the point of an option's `value`
          being separate from what it displays. */}
      <Readout label="country" value={country ?? "—"} />
    </View>
  );
}

const useStyles = createStyles(({ spacing }) => ({
  container: {
    gap: spacing.x12,
  },
}));
