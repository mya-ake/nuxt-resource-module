import axios, { AxiosInstance, CancelTokenSource, CancelToken } from 'axios';
import {
  MethodName,
  RequestMethod,
  ResourceConstructor,
  ResourceRequestMethods,
  ResourceRequestConfig,
  ResourceDelayProperty,
  ResourceMayBeCancelProperty,
  ResourceDelayRequestConfig,
  ResourceResponse,
  ResourceExtendings,
} from '@/interfaces';

const createDefaultResourceRequestConfig = (): ResourceRequestConfig => {
  return {
    url: '',
  };
};

export class Resource implements ResourceRequestMethods {
  private axios: AxiosInstance;
  private isServer: boolean;
  private delayRequestConfigs: ResourceDelayRequestConfig[];
  private cancelSources: Map<string, CancelTokenSource>;
  private extendings: ResourceExtendings;
  delay: ResourceDelayProperty;
  mayBeCancel: ResourceMayBeCancelProperty;
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
    this.mayBeCancel = this.buildMayBeCancelMethods(methods);
    this.extendings = {};
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
      config: ResourceRequestConfig = createDefaultResourceRequestConfig(),
    ): Promise<ResourceResponse | any> => {
      const response = await this.axios
        .request({
          ...config,
          method: methodName,
        })
        .then(
          (response): ResourceResponse => {
            return {
              ...response,
              canceled: false,
              delayed: false,
            } as ResourceResponse;
          },
        )
        .catch(
          (err): ResourceResponse => {
            return {
              ...err.response,
              canceled: axios.isCancel(err),
            } as ResourceResponse;
          },
        );
      return this.processResponse(response, config);
    }).bind(this);
  }

  private buildDelayMethods(methodNames: MethodName[]): ResourceDelayProperty {
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
    const method = this[methodName];
    if (typeof method !== 'function') {
      throw new Error(`Undefined method: ${methodName}`);
    }
    return (async (
      config: ResourceRequestConfig = createDefaultResourceRequestConfig(),
    ): Promise<ResourceResponse | any> => {
      if (this.isServer) {
        return method(config);
      }

      this.addDelayRequestConifg({ methodName, config });
      const response = { delayed: true, canceled: false } as ResourceResponse;
      return this.processResponse(response, config);
    }).bind(this);
  }

  private buildMayBeCancelMethods(
    methodNames: MethodName[],
  ): ResourceMayBeCancelProperty {
    const mayBeCancel = {};
    const _this = this;
    methodNames.forEach((methodName: MethodName) => {
      Object.defineProperty(mayBeCancel, methodName, {
        get() {
          return _this.createMayBeCancelMethod(methodName);
        },
      });
    });
    return mayBeCancel;
  }

  private createMayBeCancelMethod(methodName): Function {
    const method = this[methodName];
    if (typeof method !== 'function') {
      throw new Error(`Undefined method: ${methodName}`);
    }
    return (async (
      config: ResourceRequestConfig = createDefaultResourceRequestConfig(),
    ): Promise<ResourceResponse | any> => {
      const { url } = config;

      const token = this.createCancelToken(url);
      config.cancelToken = token;

      const response = await method(config);

      this.deleteCancelToken(url);
      return response;
    }).bind(this);
  }

  private processResponse(
    response: ResourceResponse,
    config: ResourceRequestConfig,
  ): ResourceResponse {
    const { dataMapper, processor } = config;
    if (typeof dataMapper === 'function') {
      response.data = dataMapper(response);
    }
    if (typeof this.extendings.eachProcessor === 'function') {
      response = this.extendings.eachProcessor(response);
    }
    if (typeof processor === 'function') {
      response = processor(response);
    }
    return response;
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

  private createCancelToken(url: string): CancelToken {
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

  public setEachProcessor(processor: Function) {
    this.extendings.eachProcessor = processor;
  }
}
