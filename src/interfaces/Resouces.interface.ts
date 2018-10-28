import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export type MethodName = 'get' | 'delete' | 'head' | 'post' | 'put' | 'patch';
export type RequestMethod = (
  config?: ResourceRequestConfig,
) => Promise<AxiosResponse | any>;

export interface ResourceConstructor {
  axios: AxiosInstance;
  methods: MethodName[];
  isServer: boolean;
}

export interface ResourceRequestMethods {
  get?: RequestMethod;
  delete?: RequestMethod;
  head?: RequestMethod;
  post?: RequestMethod;
  put?: RequestMethod;
  patch?: RequestMethod;
}

export interface ResourceRequestConfig extends AxiosRequestConfig {
  dataMapper?: (response: AxiosResponse) => any;
  processor?: (response: AxiosResponse) => any;
}

export interface ResourceDelayRequestConfig {
  method: MethodName;
  config: ResourceRequestConfig;
}

export interface ResourceDealyProperty extends ResourceRequestMethods {}
