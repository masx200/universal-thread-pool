"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createThreadPool = void 0;
// import type { Ref } from "./deps.ts";
const deps_js_1 = require("../deps.js");
const get_cpu_Count_js_1 = require("./get_cpu_Count.js");
function createThreadPool({ create, minThreads = 1, terminate, maxThreads = (0, get_cpu_Count_js_1.get_cpu_Count)(), }) {
    if (typeof create !== "function") {
        throw Error("expect create to be function:" + create);
    }
    if (typeof terminate !== "function") {
        throw Error("expect terminate to be function:" + terminate);
    }
    if (minThreads > maxThreads || minThreads <= 0) {
        throw new Error("minThreads must be smaller than maxThreads and greater than 0:" +
            minThreads +
            "," +
            maxThreads);
    }
    const queue = (0, deps_js_1.reactive)(new Map());
    const destroyed = (0, deps_js_1.ref)(false);
    let id = 0;
    const pending = (0, deps_js_1.reactive)(new Map());
    const results = (0, deps_js_1.reactive)(new Map());
    const free /* : Ref<boolean> */ = (0, deps_js_1.computed)(() => {
        return pending.size < maxThreads;
    });
    const f = (0, deps_js_1.effect)(() => {
        if (queue.size === 0) {
            return;
        }
        if (free.value) {
            Promise.resolve().then(() => {
                next();
            });
        }
    });
    const threads = [];
    for (let i = 0; i < minThreads; i++)
        create_and_push_thread();
    function run(callback, signal) {
        // debugger;
        if (destroyed.value) {
            throw new Error("can not run on destroyed pool");
        }
        const task_id = id;
        id++;
        add(callback, task_id);
        if (free.value) {
            Promise.resolve().then(() => {
                next();
            });
        }
        return new Promise((resolve, reject) => {
            const abort_listener = () => {
                reject(new Error("task signal aborted"));
                clean();
                const maps = [queue, pending, results];
                const w = pending.get(task_id);
                maps.forEach((m) => m.delete(task_id));
                // const index = task_id % maxThreads;
                // const w = get(task_id);
                w && terminate(w);
                remove_thread(w);
            };
            if (signal) {
                signal.addEventListener("abort", abort_listener);
                if (signal.aborted) {
                    abort_listener();
                }
            }
            function clean() {
                (0, deps_js_1.stop)(d);
                (0, deps_js_1.stop)(e);
                if (signal) {
                    signal.removeEventListener("abort", abort_listener);
                }
            }
            const d = (0, deps_js_1.effect)(() => {
                if (destroyed.value) {
                    reject(new Error("pool is destroyed"));
                    (0, deps_js_1.stop)(d);
                    clean();
                }
            });
            const e = (0, deps_js_1.effect)(() => {
                const result = results.get(task_id);
                if (result) {
                    resolve(result);
                    (0, deps_js_1.stop)(e);
                    results.delete(task_id);
                    clean();
                }
            });
        });
    }
    function get(task_id) {
        const index = task_id % maxThreads;
        while (typeof threads[index] === "undefined") {
            create_and_push_thread();
        }
        return threads[index];
    }
    function create_and_push_thread() {
        const thread = create();
        if (typeof thread === "undefined") {
            throw Error("thread created undefined");
        }
        threads.push(thread);
    }
    function remove_thread(thread) {
        const index = threads.findIndex((v) => thread === v);
        // if (index < 0) {
        //     throw Error("thread not found");
        // }
        if (index > 0) {
            threads.splice(index, 1);
        }
    }
    function add(callback, task_id) {
        queue.set(task_id, callback);
    }
    function next() {
        // debugger;
        if (pending.size >= maxThreads) {
            return;
        }
        if (queue.size === 0) {
            return;
        }
        if (queue.size) {
            const [task_id, callback] = [...queue.entries()][0];
            queue.delete(task_id);
            const w = get(task_id);
            pending.set(task_id, w);
            const p = Promise.resolve(callback(w));
            p.finally(() => {
                pending.delete(task_id);
                results.set(task_id, p);
            });
            Promise.resolve().then(() => {
                next();
            });
        }
    }
    function destroy() {
        threads.forEach((w) => terminate(w));
        threads.length = 0;
        pending.clear();
        results.clear();
        queue.clear();
        (0, deps_js_1.stop)(f);
        destroyed.value = true;
    }
    function onQueueSizeChange(callback) {
        const r = (0, deps_js_1.effect)(() => {
            callback(queue.size);
        });
        return () => {
            (0, deps_js_1.stop)(r);
        };
    }
    function onPendingSizeChange(callback) {
        const r = (0, deps_js_1.effect)(() => {
            callback(pending.size);
        });
        return () => {
            (0, deps_js_1.stop)(r);
        };
    }
    return {
        minThreads,
        onPendingSizeChange,
        onQueueSizeChange,
        queueSize() {
            return queue.size;
        },
        pendingSize() {
            return pending.size;
        },
        threads: (0, deps_js_1.shallowReadonly)(threads),
        destroy,
        run,
        destroyed() {
            return destroyed.value;
        },
        maxThreads,
        [Symbol.toStringTag]: "ThreadPool",
        free() {
            return free.value;
        },
        busy() {
            return !free.value;
        },
        drain() {
            return queue.size === 0;
        },
    };
}
exports.createThreadPool = createThreadPool;
