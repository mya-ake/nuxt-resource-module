import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { MethodName } from './Common.type';
export interface ResourceConstructor {
    axios: AxiosInstance;
    methods?: MethodName[];
    isServer: boolean;
}
export declare type RequestMethod = (config?: ResourceRequestConfig) => Promise<AxiosResponse | any>;
export interface ResourceRequestMethods {
    get?: RequestMethod;
    delete?: RequestMethod;
    head?: RequestMethod;
    post?: RequestMethod;
    put?: RequestMethod;
    patch?: RequestMethod;
}
export interface ResourceDelayProperty extends ResourceRequestMethods {
}
export interface ResourceMayBeCancelProperty extends ResourceRequestMethods {
}
export interface ResourceRequestConfig extends AxiosRequestConfig {
    url: string;
    dataMapper?: (response: ResourceResponse) => any;
    processor?: (response: ResourceResponse) => any;
}
export interface ResourceDelayRequestConfig {
    methodName: MethodName;
    config: ResourceRequestConfig;
}
export interface ResourceResponse extends AxiosResponse {
    canceled: boolean;
    delayed: boolean;
}
export interface ResourceExtendings {
    eachProcessor?: Function;
}
