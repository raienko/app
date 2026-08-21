import { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  type TextInput as RNTextInputInstance,
} from "react-native";

import Accordion from "@/components/accordion";
import Button from "@/components/button";
import Counter from "@/components/counter";
import Icon from "@/components/icon";
import Input from "@/components/input";
import Modal from "@/components/modal";
import Screen from "@/components/screen";
import Text from "@/components/text";
import ThemeSwitcher from "@/components/theme-switcher";
import env from "@/constants/env";
import { createStyles, useUnits } from "@/features/responsive";

export default function Home() {
  const units = useUnits();
  const styles = useStyles();
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const emailRef = useRef<RNTextInputInstance>(null);
  const emailError =
    email && !email.includes("@") ? "Enter a valid email" : undefined;

  return (
    <Screen style={styles.container}>
      <View style={styles.title}>
        <Icon name="home" size={units(20)} />
        <Text value={env.appName} />
      </View>

      <Accordion title="Counter & Theme">
        <Counter storageKey="home-demo-counter" />
        <ThemeSwitcher />
      </Accordion>

      <Accordion title="Input">
        <View style={styles.form}>
          <Input
            label="Name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={setName}
            leftSlot={<Icon name="user" />}
            helperText="This is displayed on your profile"
          />
          <Input
            type="numeric"
            label="Age"
            placeholder="0"
            value={age}
            onChange={setAge}
            min={0}
            max={120}
            leftSlot={<Icon name="hash" />}
          />
          <Input
            ref={emailRef}
            type="email"
            label="Email"
            placeholder="ada@example.com"
            value={email}
            onChange={setEmail}
            leftSlot={<Icon name="mail" />}
            error={emailError}
          />
          <Button
            value="Focus email"
            onPress={() => emailRef.current?.focus()}
          />
          <Text
            value={`name: ${name || "—"} / age: ${age ?? "—"} / email: ${email || "—"}`}
          />
        </View>
      </Accordion>

      <Accordion title="Modal">
        <View style={styles.form}>
          <Button value="Popup" onPress={() => Modal.show("home-popup")} />
          <Button
            value="Bottom sheet"
            onPress={() => Modal.show("home-bottom-sheet")}
          />
          <Button value="Actions" onPress={() => Modal.show("home-actions")} />
          <Button
            value="Fullscreen"
            onPress={() => Modal.show("home-fullscreen")}
          />
        </View>
      </Accordion>

      <Modal id="home-popup" type="popup">
        <Text value="Popup modal" />
        <Button value="Close" onPress={() => Modal.hide("home-popup")} />
      </Modal>

      <Modal id="home-bottom-sheet" type="bottomSheet">
        <Text value="Bottom sheet modal" />
        <Button value="Close" onPress={() => Modal.hide("home-bottom-sheet")} />
      </Modal>

      <Modal id="home-actions" type="actions">
        <Button value="Option A" onPress={() => Modal.hide("home-actions")} />
        <Button value="Option B" onPress={() => Modal.hide("home-actions")} />
        <Button value="Close" onPress={() => Modal.hide("home-actions")} />
      </Modal>

      <Modal id="home-fullscreen" type="fullscreen">
        <Text value="Fullscreen modal" />
        <Button value="Close" onPress={() => Modal.hide("home-fullscreen")} />
      </Modal>
    </Screen>
  );
}

const useStyles = createStyles(({ units }) =>
  StyleSheet.create({
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
  }),
);
