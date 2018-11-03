import axios, { AxiosInstance, AxiosResponse, CancelTokenSource } from 'axios';
import {
  MethodName,
  RequestMethod,
  ResourceConstructor,
  ResourceRequestMethods,
  ResourceRequestConfig,
  ResourceDealyProperty,
  ResourceDelayRequestConfig,
} from '@/interfaces';

export class Resource implements ResourceRequestMethods {
  private axios: AxiosInstance;
  private isServer: boolean;
  private delayRequestConfigs: ResourceDelayRequestConfig[];
  private cancelSources: Map<string, CancelTokenSource>;
  delay: ResourceDealyProperty;
  get?: RequestMethod;
  delete?: RequestMethod;
  head?: RequestMethod;
  post?: RequestMethod;
  put?: RequestMethod;
  patch?: RequestMethod;

  constructor({ axios, methods = ['get'], isServer }: ResourceConstructor) {
    this.axios = axios;
    this.isServer = isServer;
    this.delayRequestConfigs = [];
    this.cancelSources = new Map();
    this.buildMethods(methods);
    this.delay = this.buildDelayMethods(methods);
  }

  public async requestDelayedRequest() {
    const requests = this.delayRequestConfigs.map(({ methodName, config }) => {
      const method = this[methodName];
      if (typeof method !== 'function') {
        throw new Error(`Undefined method: ${methodName}`);
      }
      return method(config);
    });
    const responses = await Promise.all(requests);
    this.clearDelayedRequest();
    return responses;
  }

  private buildMethods(methodNames: MethodName[]) {
    const _this = this;
    methodNames.forEach((methodName: MethodName) => {
      Object.defineProperty(this, methodName, {
        get() {
          return _this.createMethod(methodName);
        },
      });
    });
  }

  private createMethod(methodName: MethodName): Function {
    return (async (
      config: ResourceRequestConfig = {},
    ): Promise<AxiosResponse | any> => {
      const response = await this.axios
        .request({
          ...config,
          method: methodName,
        })
        .catch(err => err.response);
      return this.processResponse(response, config);
    }).bind(this);
  }

  private buildDelayMethods(methodNames: MethodName[]): ResourceDealyProperty {
    const delay = {};
    const _this = this;
    methodNames.forEach((methodName: MethodName) => {
      Object.defineProperty(delay, methodName, {
        get() {
          return _this.createDelayMethod(methodName);
        },
      });
    });
    return delay;
  }

  private createDelayMethod(methodName: MethodName): Function {
    return (async (
      config: ResourceRequestConfig = {},
    ): Promise<AxiosResponse | any> => {
      const method = this[methodName];
      if (typeof method !== 'function') {
        throw new Error(`Undefined method: ${methodName}`);
      }

      if (this.isServer) {
        return method(config);
      }
      this.addDelayRequestConifg({ methodName, config });
      const response = { data: {} } as AxiosResponse;
      return this.processResponse(response, config);
    }).bind(this);
  }

  private processResponse(
    response: AxiosResponse,
    config: ResourceRequestConfig,
  ): AxiosResponse {
    const { dataMapper, processor } = config;
    if (typeof dataMapper === 'function') {
      response.data = dataMapper(response);
    }
    return typeof processor === 'function' ? processor(response) : response;
  }

  private addDelayRequestConifg({
    methodName,
    config,
  }: ResourceDelayRequestConfig) {
    this.delayRequestConfigs.push({ methodName, config });
  }

  public clearDelayedRequest() {
    this.delayRequestConfigs = [];
  }

  private createCancelToken(url: string) {
    const source = axios.CancelToken.source();
    this.cancelSources.set(url, source);
    return source.token;
  }

  private deleteCancelToken(url: string) {
    this.cancelSources.delete(url);
  }

  public cancel(url: string) {
    const source = this.cancelSources.get(url);
    if (!source) {
      return;
    }
    source.cancel();
    this.deleteCancelToken(url);
  }

  public cancelAll() {
    this.cancelSources.forEach((source, url) => {
      this.cancel(url);
    });
  }
}
