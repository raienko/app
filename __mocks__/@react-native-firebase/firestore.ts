export default () => ({
  collection: () => ({
    onSnapshot: () => false,
    get: async () => false,
  }),
});
