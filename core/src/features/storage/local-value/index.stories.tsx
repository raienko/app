import Counter from "@/components/counter";

const meta = {
  title: "features/LocalValue",
  component: Counter,
};

export default meta;

export const Default = {
  args: {
    storageKey: "storybook-demo-counter",
  },
};
