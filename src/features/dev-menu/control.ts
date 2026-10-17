import Modal from "@/components/modal";

export const DEV_MENU_ID = "dev-menu";

/**
 * Opens and closes the in-app dev menu from anywhere. Development builds
 * only: in production `isEnabled` is `false`, nothing is mounted and these
 * do nothing.
 */
export const devMenu = {
  isEnabled: __DEV__,
  open: () => {
    if (__DEV__) Modal.show(DEV_MENU_ID);
  },
  close: () => {
    if (__DEV__) Modal.hide(DEV_MENU_ID);
  },
};
