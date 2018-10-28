import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ResourceConstructor {
  axios: AxiosInstance;
  methods: string[];
}

export interface ResourceRequestConfig extends AxiosRequestConfig {
  dataMapper?: (response: AxiosResponse) => any;
  processor?: (response: AxiosResponse) => any;
}
