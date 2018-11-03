import CancelToken from 'axios/lib/cancel/CancelToken';

jest.mock('axios', () => {
  return {
    async request(args: any) {
      return {};
    },
    CancelToken,
  };
});
