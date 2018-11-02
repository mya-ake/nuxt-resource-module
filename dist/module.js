var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import path from 'path';
var defaultOption = {
    methods: ['get', 'delete', 'head', 'post', 'put', 'patch'],
};
export default function nuxtResourceModule(_moduleOption) {
    var moduleOption = __assign({}, defaultOption, this.options['resource-module'], _moduleOption);
    this.addPlugin({
        src: path.resolve(__dirname, 'templates', 'plugin.template.js'),
        ssr: true,
        options: __assign({ pluginSrc: path.resolve(__dirname, 'index.js') }, moduleOption),
    });
}
