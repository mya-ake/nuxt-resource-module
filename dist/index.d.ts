import { Resource } from './core';
import { ResourceConstructor } from './interfaces';
export declare const buildPlugin: (option: ResourceConstructor) => {
    resource: Resource;
    ResroucePlugin: {
        install: (Vue: import("vue/types/vue").VueConstructor<import("vue/types/vue").Vue>) => void;
    };
};
