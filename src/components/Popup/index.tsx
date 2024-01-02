import React, {useState} from 'react';
import {View, StyleSheet, Modal, Pressable} from 'react-native';
import {eventBus, useEventBus} from '~/src/utils';
import {system} from '~/src/features';
import {colors, sizes} from '~/src/constants';
import {TranslationKey} from '~/src/features/system';
import Text from '~/src/components/Text';
import If from '~/src/components/If';
import Button from '~/src/components/Button';

type PopupProps = {
  id: string;
  style?: any;
  index?: number;
  children?: React.ReactNode;
  height?: number;
  title?: TranslationKey;
  subtitle?: TranslationKey;
  submitText?: TranslationKey;
  onSubmit?: () => any;
  cancelText?: TranslationKey;
  onCancel?: () => any;
  onClose?: () => any;
};

const getEventKey = (id: string) => `TOGGLE_POPUP_${id}`;

const togglePopup = (id: string, value: boolean) =>
  eventBus.dispatch(getEventKey(id), value);

export const showPopup = (id: string) => togglePopup(id, true);

export const hidePopup = (id: string) => togglePopup(id, false);

export default function Popup({
  id,
  style,
  title,
  subtitle,
  onSubmit,
  onCancel,
  submitText = 'general.popup_submit',
  cancelText = 'general.popup_cancel',
  onClose,
  children,
}: PopupProps) {
  const [visible, setVisible] = useState(false);
  const darkMode = system.useDarkMode();
  const eventKey = getEventKey(id);
  useEventBus(eventKey, setVisible);

  const backgroundColor = darkMode
    ? colors.secondaryDark
    : colors.secondaryLight;
  const appearance = [styles.container, {backgroundColor}].concat(style);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => hidePopup(id)}>
      <View style={styles.wrapper}>
        <Pressable
          style={styles.fade}
          onPress={() => {
            hidePopup(id);
            onClose?.();
          }}
        />
        <View style={appearance}>
          <If condition={!!title}>
            <Text text={title} type="h3" />
          </If>
          <If condition={!!subtitle}>
            <Text text={subtitle} />
          </If>
          {children}
          <If condition={!!onSubmit}>
            <Button text={submitText} onPress={onSubmit} type="primary" />
          </If>
          <If condition={!!onCancel}>
            <Button text={cancelText} onPress={onCancel} type="tertiary" />
          </If>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: sizes.offsetM,
    rowGap: sizes.offsetM,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: sizes.uiRadius,
  },
  fade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.fade,
  },
});
