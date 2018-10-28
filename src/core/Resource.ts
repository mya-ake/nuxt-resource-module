import { AxiosInstance, AxiosResponse } from 'axios';
import { ResourceConstructor, ResourceRequestConfig } from '@/interfaces';

export class Resource {
  private axios: AxiosInstance;
  get?: (config?: ResourceRequestConfig) => Promise<AxiosResponse | any>;
  delete?: (config?: ResourceRequestConfig) => Promise<AxiosResponse | any>;
  head?: (config?: ResourceRequestConfig) => Promise<AxiosResponse | any>;
  post?: (config?: ResourceRequestConfig) => Promise<AxiosResponse | any>;
  put?: (config?: ResourceRequestConfig) => Promise<AxiosResponse | any>;
  patch?: (config?: ResourceRequestConfig) => Promise<AxiosResponse | any>;

  constructor({ axios, methods = ['get'] }: ResourceConstructor) {
    this.axios = axios;
    this.buildMethods(methods);
  }

  private buildMethods(methodNames: string[]) {
    const _this = this;
    methodNames.forEach(methodName => {
      Object.defineProperty(this, methodName, {
        get() {
          return _this.createMethod(methodName);
        },
      });
    });
  }

  private createMethod(methodName: string): Function {
    return (async (
      args: ResourceRequestConfig = {},
    ): Promise<AxiosResponse> => {
      const response = await this.axios
        .request({
          ...args,
          method: methodName,
        })
        .catch(err => err.response);
      const { dataMapper, processor } = args;
      if (typeof dataMapper === 'function') {
        response.data = dataMapper(response);
      }
      return typeof processor === 'function' ? processor(response) : response;
    }).bind(this);
  }
}
