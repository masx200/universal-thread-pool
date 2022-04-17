"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_cpu_Count = void 0;
const get_cpu_Count = function () {
    if (typeof navigator !== "undefined") {
        return navigator.hardwareConcurrency;
    }
    if (typeof os !== "undefined") {
        return os.cpus().length;
    }
    return 1;
};
exports.get_cpu_Count = get_cpu_Count;
