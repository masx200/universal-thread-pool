"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stop = exports.shallowReadonly = exports.ref = exports.reactive = exports.effect = exports.computed = void 0;
var reactivity_1 = require("@vue/reactivity");
Object.defineProperty(exports, "computed", { enumerable: true, get: function () { return reactivity_1.computed; } });
Object.defineProperty(exports, "effect", { enumerable: true, get: function () { return reactivity_1.effect; } });
Object.defineProperty(exports, "reactive", { enumerable: true, get: function () { return reactivity_1.reactive; } });
Object.defineProperty(exports, "ref", { enumerable: true, get: function () { return reactivity_1.ref; } });
Object.defineProperty(exports, "shallowReadonly", { enumerable: true, get: function () { return reactivity_1.shallowReadonly; } });
Object.defineProperty(exports, "stop", { enumerable: true, get: function () { return reactivity_1.stop; } });
// export {
//     assert,
//     assertEquals,
// } from "https://deno.land/std@0.135.0/testing/asserts.ts";
// export type { Ref } from "https://esm.sh/@vue/reactivity@3.2.33?dts";
