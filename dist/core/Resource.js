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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import axios from 'axios';
var createDefaultResourceRequestConfig = function () {
    return {
        url: '',
    };
};
var Resource = /** @class */ (function () {
    function Resource(_a) {
        var axios = _a.axios, _b = _a.methods, methods = _b === void 0 ? ['get'] : _b, isServer = _a.isServer;
        this.axios = axios;
        this.isServer = isServer;
        this.delayRequestConfigs = [];
        this.cancelSources = new Map();
        this.request = this.createMethod('request');
        this.buildMethods(methods);
        this.delay = this.buildDelayMethods(methods);
        this.mayBeCancel = this.buildMayBeCancelMethods(methods);
        this.extendings = {};
    }
    Resource.prototype.requestDelayedRequest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requests, responses;
            var _this_1 = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requests = this.delayRequestConfigs.map(function (_a) {
                            var methodName = _a.methodName, config = _a.config;
                            var method = _this_1[methodName];
                            if (typeof method !== 'function') {
                                throw new Error("Undefined method: " + methodName);
                            }
                            return method(config);
                        });
                        return [4 /*yield*/, Promise.all(requests)];
                    case 1:
                        responses = _a.sent();
                        this.clearDelayedRequest();
                        return [2 /*return*/, responses];
                }
            });
        });
    };
    Resource.prototype.buildMethods = function (methodNames) {
        var _this_1 = this;
        var _this = this;
        methodNames.forEach(function (methodName) {
            Object.defineProperty(_this_1, methodName, {
                get: function () {
                    return _this.createMethod(methodName);
                },
            });
        });
    };
    Resource.prototype.createMethod = function (methodName) {
        var _this_1 = this;
        return (function (_config) {
            if (_config === void 0) { _config = createDefaultResourceRequestConfig(); }
            return __awaiter(_this_1, void 0, void 0, function () {
                var config, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            config = methodName === 'request'
                                ? _config
                                : __assign({}, _config, { method: methodName });
                            return [4 /*yield*/, this.axios
                                    .request(config)
                                    .then(function (response) {
                                    return __assign({}, response, { canceled: false, delayed: false });
                                })
                                    .catch(function (err) {
                                    return __assign({}, err.response, { canceled: axios.isCancel(err) });
                                })];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, this.processResponse(response, config)];
                    }
                });
            });
        }).bind(this);
    };
    Resource.prototype.buildDelayMethods = function (methodNames) {
        var delay = {};
        var _this = this;
        delay.request = this.createDelayMethod('request');
        methodNames.forEach(function (methodName) {
            Object.defineProperty(delay, methodName, {
                get: function () {
                    return _this.createDelayMethod(methodName);
                },
            });
        });
        return delay;
    };
    Resource.prototype.createDelayMethod = function (methodName) {
        var _this_1 = this;
        var method = this[methodName];
        if (typeof method !== 'function') {
            throw new Error("Undefined method: " + methodName);
        }
        return (function (config) {
            if (config === void 0) { config = createDefaultResourceRequestConfig(); }
            return __awaiter(_this_1, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    if (this.isServer) {
                        return [2 /*return*/, method(config)];
                    }
                    this.addDelayRequestConifg({ methodName: methodName, config: config });
                    response = { delayed: true, canceled: false };
                    return [2 /*return*/, this.processResponse(response, config)];
                });
            });
        }).bind(this);
    };
    Resource.prototype.buildMayBeCancelMethods = function (methodNames) {
        var mayBeCancel = {};
        var _this = this;
        mayBeCancel.request = this.createMayBeCancelMethod('request');
        methodNames.forEach(function (methodName) {
            Object.defineProperty(mayBeCancel, methodName, {
                get: function () {
                    return _this.createMayBeCancelMethod(methodName);
                },
            });
        });
        return mayBeCancel;
    };
    Resource.prototype.createMayBeCancelMethod = function (methodName) {
        var _this_1 = this;
        var method = this[methodName];
        if (typeof method !== 'function') {
            throw new Error("Undefined method: " + methodName);
        }
        return (function (config) {
            if (config === void 0) { config = createDefaultResourceRequestConfig(); }
            return __awaiter(_this_1, void 0, void 0, function () {
                var url, token, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = config.url;
                            token = this.createCancelToken(url);
                            config.cancelToken = token;
                            return [4 /*yield*/, method(config)];
                        case 1:
                            response = _a.sent();
                            this.deleteCancelToken(url);
                            return [2 /*return*/, response];
                    }
                });
            });
        }).bind(this);
    };
    Resource.prototype.processResponse = function (response, config) {
        var dataMapper = config.dataMapper, processor = config.processor;
        if (typeof dataMapper === 'function') {
            response.data = dataMapper(response);
        }
        if (typeof this.extendings.eachProcessor === 'function') {
            response = this.extendings.eachProcessor(response);
        }
        if (typeof processor === 'function') {
            response = processor(response);
        }
        return response;
    };
    Resource.prototype.addDelayRequestConifg = function (_a) {
        var methodName = _a.methodName, config = _a.config;
        this.delayRequestConfigs.push({ methodName: methodName, config: config });
    };
    Resource.prototype.clearDelayedRequest = function () {
        this.delayRequestConfigs = [];
    };
    Resource.prototype.createCancelToken = function (url) {
        var source = axios.CancelToken.source();
        this.cancelSources.set(url, source);
        return source.token;
    };
    Resource.prototype.deleteCancelToken = function (url) {
        this.cancelSources.delete(url);
    };
    Resource.prototype.cancel = function (url) {
        var source = this.cancelSources.get(url);
        if (!source) {
            return;
        }
        source.cancel();
        this.deleteCancelToken(url);
    };
    Resource.prototype.cancelAll = function () {
        var _this_1 = this;
        this.cancelSources.forEach(function (source, url) {
            _this_1.cancel(url);
        });
    };
    Resource.prototype.setEachProcessor = function (processor) {
        this.extendings.eachProcessor = processor;
    };
    return Resource;
}());
export { Resource };
