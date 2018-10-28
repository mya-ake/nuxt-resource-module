import { AxiosInstance, AxiosResponse } from 'axios';
import {
  MethodName,
  RequestMethod,
  ResourceConstructor,
  ResourceRequestMethods,
  ResourceRequestConfig,
} from '@/interfaces';

export class Resource implements ResourceRequestMethods {
  private axios: AxiosInstance;
  get?: RequestMethod;
  delete?: RequestMethod;
  head?: RequestMethod;
  post?: RequestMethod;
  put?: RequestMethod;
  patch?: RequestMethod;

  constructor({ axios, methods = ['get'] }: ResourceConstructor) {
    this.axios = axios;
    this.buildMethods(methods);
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
      args: ResourceRequestConfig = {},
    ): Promise<AxiosResponse | any> => {
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
