import { Resource } from './../../../src/core/Resource';
import { MethodName } from './../../../src/interfaces';
import axios, { AxiosRequestConfig } from 'axios';

describe('core/Resource', () => {
  let resource: Resource;
  const spyRequest = jest.spyOn(axios, 'request');

  beforeEach(() => {
    const methodNames = ['get', 'post'] as MethodName[];
    resource = new Resource({
      axios,
      isServer: false,
      methods: methodNames,
    });
    spyRequest.mockClear();
  });

  describe('constructor', () => {
    it('created request methods', () => {
      expect.assertions(2);
      expect(resource).toHaveProperty('get');
      expect(resource).toHaveProperty('post');
    });

    it('created delay request methods', () => {
      expect.assertions(2);
      expect(resource.delay).toHaveProperty('get');
      expect(resource.delay).toHaveProperty('post');
    });
  });

  describe('request methods', () => {
    it('expect argument, when get method', async () => {
      await resource.get({ url: '/users' });

      expect.assertions(2);
      expect(spyRequest).toHaveBeenCalledTimes(1);
      expect(spyRequest).toHaveBeenCalledWith({ method: 'get', url: '/users' });
    });

    it('runs dataMapper', async () => {
      const response = await resource.get({
        url: '/users',
        dataMapper(response) {
          return { test: 'mapper response' };
        },
      });

      expect(response.data).toEqual({ test: 'mapper response' });
    });

    it('runs processor', async () => {
      const response = await resource.get({
        url: '/users',
        processor(response) {
          return {
            status: 200,
            isError: false,
            data: { test: 'processor data' },
          };
        },
      });

      expect.assertions(3);
      expect(response).toHaveProperty('isError');
      expect(response).toHaveProperty('data');
      expect(response.data).toEqual({ test: 'processor data' });
    });
  });

  describe('delay methods', () => {
    it('client', async () => {
      await resource.delay.get({
        url: '/users',
      });

      expect.assertions(2);
      expect(spyRequest).not.toHaveBeenCalled();
      expect(resource['delayRequestConfigs']).toEqual([
        {
          methodName: 'get',
          config: { url: '/users' },
        },
      ]);
    });

    it('server', async () => {
      resource = new Resource({
        axios,
        isServer: true,
        methods: ['get'],
      });
      await resource.delay.get({
        url: '/users',
      });

      expect.assertions(3);
      expect(spyRequest).toHaveBeenCalledTimes(1);
      expect(spyRequest).toHaveBeenCalledWith({ method: 'get', url: '/users' });
      expect(resource['delayRequestConfigs']).toHaveLength(0);
    });

    it('runs requestDelayedRequest', async () => {
      resource['delayRequestConfigs'] = [
        {
          methodName: 'get',
          config: { url: '/users' },
        },
      ];

      await resource.requestDelayedRequest();

      expect.assertions(3);
      expect(spyRequest).toHaveBeenCalledTimes(1);
      expect(spyRequest).toHaveBeenCalledWith({ method: 'get', url: '/users' });
      expect(resource['delayRequestConfigs']).toEqual([]);
    });

    it('runs clearDelayedRequest', async () => {
      resource['delayRequestConfigs'] = [
        {
          methodName: 'get',
          config: { url: '/users' },
        },
      ];

      resource.clearDelayedRequest();

      expect(resource['delayRequestConfigs']).toEqual([]);
    });
  });
});