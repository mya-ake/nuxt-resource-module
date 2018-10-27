jest.mock('axios', () => {
  return {
    async request(args: any) {
      return {};
    },
  };
});
