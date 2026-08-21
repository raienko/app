import Component from "./index";

const meta = {
  title: "components/Button",
  component: Component,
};

export default meta;

export const Default = {
  args: {
    value: "press me",
  },
};

export const Selected = {
  args: {
    value: "selected",
    selected: true,
  },
};
