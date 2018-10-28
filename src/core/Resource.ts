import { AxiosInstance, AxiosResponse } from 'axios';
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
    this.buildMethods(methods);
    this.delay = this.buildDelayMethods(methods);
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
      this.delayRequestConfigs.push({ method: methodName, config });
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
}
