import { Resource } from './../../../src/core/Resource';
import axios, { AxiosRequestConfig } from 'axios';

describe('core/Resource', () => {
  let spyRequest: jest.SpyInstance;
  let resource: Resource;
  beforeEach(() => {
    spyRequest = jest.spyOn(axios, 'request');

    const methodNames = ['get', 'post'];
    resource = new Resource({
      axios,
      methods: methodNames,
    });
  });

  describe('constructor', () => {
    it('created request methods', () => {
      expect.assertions(2);
      expect(resource).toHaveProperty('get');
      expect(resource).toHaveProperty('post');
    });
  });

  describe('request methods, get, post', () => {
    it('expect argument, when get method', async () => {
      await resource.get({ url: '/users' });

      expect.assertions(2);
      expect(spyRequest).toHaveBeenCalledTimes(1);
      expect(spyRequest).toHaveBeenCalledWith({ method: 'get', url: '/users' });
    });
  });
});
