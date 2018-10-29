import { Resource } from './core';
import pluginBuilder from './builder/plugin-builder';
export var buildPlugin = function (option) {
    var resource = new Resource(option);
    var ResroucePlugin = pluginBuilder(resource);
    return {
        resource: resource,
        ResroucePlugin: ResroucePlugin,
    };
};
