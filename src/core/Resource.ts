import { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { ResourceInterface } from '@/interfaces';

export class Resource {
  private axios: AxiosInstance;
  get?: (config?: AxiosRequestConfig) => Promise<AxiosResponse>;
  delete?: (config?: AxiosRequestConfig) => Promise<AxiosResponse>;
  head?: (config?: AxiosRequestConfig) => Promise<AxiosResponse>;
  post?: (config?: AxiosRequestConfig) => Promise<AxiosResponse>;
  put?: (config?: AxiosRequestConfig) => Promise<AxiosResponse>;
  patch?: (config?: AxiosRequestConfig) => Promise<AxiosResponse>;

  constructor({ axios, methods = ['get'] }: ResourceInterface) {
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
    return (async (args: AxiosRequestConfig = {}): Promise<AxiosResponse> => {
      const response = await this.axios
        .request({
          ...args,
          method: methodName,
        })
        .catch(err => err.response);
      return response;
    }).bind(this);
  }
}
