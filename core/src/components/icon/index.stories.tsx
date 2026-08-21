import Component from "./index";

const meta = {
  title: "components/Icon",
  component: Component,
};

export default meta;

export const Default = {
  args: {
    name: "home",
  },
};

export const Feather = {
  args: {
    type: "Feather",
    name: "home",
    color: "red",
    size: 32,
  },
};

export const MaterialIcons = {
  args: {
    type: "MaterialIcons",
    name: "home",
    size: 32,
  },
};

export const Custom = {
  args: {
    type: "custom",
    name: "logo",
    size: 32,
  },
};
