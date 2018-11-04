import { RequestMethod, ResourceConstructor, ResourceRequestMethods, ResourceDelayProperty } from '@/interfaces';
export declare class Resource implements ResourceRequestMethods {
    private axios;
    private isServer;
    private delayRequestConfigs;
    delay: ResourceDelayProperty;
    get?: RequestMethod;
    delete?: RequestMethod;
    head?: RequestMethod;
    post?: RequestMethod;
    put?: RequestMethod;
    patch?: RequestMethod;
    constructor({ axios, methods, isServer }: ResourceConstructor);
    requestDelayedRequest(): Promise<any[]>;
    clearDelayedRequest(): void;
    private buildMethods;
    private createMethod;
    private buildDelayMethods;
    private createDelayMethod;
    private processResponse;
    private addDelayRequestConifg;
}
