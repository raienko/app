import { useRef, useState } from "react";
import { View, type TextInput as RNTextInputInstance } from "react-native";

import Accordion from "@/components/accordion";
import Button from "@/components/button";
import Counter from "@/components/counter";
import Icon from "@/components/icon";
import Input from "@/components/input";
import LocaleSwitcher from "@/components/locale-switcher";
import Modal from "@/components/modal";
import Screen from "@/components/screen";
import Text from "@/components/text";
import ThemeSwitcher from "@/components/theme-switcher";
import env from "@/constants/env";
import { useLocale } from "@/features/localization";
import { createStyles, useUnits } from "@/features/responsive";

export default function Home() {
  const units = useUnits();
  const styles = useStyles();
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const emailRef = useRef<RNTextInputInstance>(null);
  const emailError =
    email && !email.includes("@") ? t("input.email.error") : undefined;

  return (
    <Screen style={styles.container}>
      <View style={styles.title}>
        <Icon name="home" size={units(20)} />
        <Text value={env.appName} />
      </View>

      <Accordion title={t("home.counterAndTheme")}>
        <Counter storageKey="home-demo-counter" />
        <ThemeSwitcher />
        <LocaleSwitcher />
      </Accordion>

      <Accordion title={t("home.input")}>
        <View style={styles.form}>
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
          <Button
            value={t("input.focusEmail")}
            onPress={() => emailRef.current?.focus()}
          />
          <Text
            value={t("home.summary", {
              name: name || "—",
              age: age ?? "—",
              email: email || "—",
            })}
          />
        </View>
      </Accordion>

      <Accordion title={t("home.modal")}>
        <View style={styles.form}>
          <Button
            value={t("modal.popup.trigger")}
            onPress={() => Modal.show("home-popup")}
          />
          <Button
            value={t("modal.bottomSheet.trigger")}
            onPress={() => Modal.show("home-bottom-sheet")}
          />
          <Button
            value={t("modal.actions.trigger")}
            onPress={() => Modal.show("home-actions")}
          />
          <Button
            value={t("modal.fullscreen.trigger")}
            onPress={() => Modal.show("home-fullscreen")}
          />
        </View>
      </Accordion>

      <Modal id="home-popup" type="popup">
        <Text value={t("modal.popup.content")} />
        <Button
          value={t("common.close")}
          onPress={() => Modal.hide("home-popup")}
        />
      </Modal>

      <Modal id="home-bottom-sheet" type="bottomSheet">
        <Text value={t("modal.bottomSheet.content")} />
        <Button
          value={t("common.close")}
          onPress={() => Modal.hide("home-bottom-sheet")}
        />
      </Modal>

      <Modal id="home-actions" type="actions">
        <Button
          value={t("modal.actions.optionA")}
          onPress={() => Modal.hide("home-actions")}
        />
        <Button
          value={t("modal.actions.optionB")}
          onPress={() => Modal.hide("home-actions")}
        />
        <Button
          value={t("common.close")}
          onPress={() => Modal.hide("home-actions")}
        />
      </Modal>

      <Modal id="home-fullscreen" type="fullscreen">
        <Text value={t("modal.fullscreen.content")} />
        <Button
          value={t("common.close")}
          onPress={() => Modal.hide("home-fullscreen")}
        />
      </Modal>
    </Screen>
  );
}

const useStyles = createStyles(({ units }) => ({
  container: {
    gap: units(16),
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: units(8),
  },
  form: {
    gap: units(12),
  },
}));
