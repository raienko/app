export default () => ({
  ref: () => ({
    onSnapshot: () => false,
    get: async () => false,
  }),
});
