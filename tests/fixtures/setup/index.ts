import axios from 'axios/lib/axios';
import CancelToken from 'axios/lib/cancel/CancelToken';
import isCancel from 'axios/lib/cancel/isCancel';

jest.mock('axios', () => {
  return {
    async request(args: any) {
      if (/may-be-cancel$/.test(args.url)) {
        return axios.request(args);
      }
      return {};
    },
    CancelToken,
    isCancel,
  };
});
