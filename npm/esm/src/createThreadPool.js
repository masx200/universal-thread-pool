// import type { Ref } from "./deps.ts";
import { computed, effect, reactive, ref, shallowReadonly, stop, } from "../deps.js";
import { get_cpu_Count } from "./get_cpu_Count.js";
export function createThreadPool({ create, minThreads = 1, terminate, maxThreads = get_cpu_Count(), }) {
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
    const queue = reactive(new Map());
    const destroyed = ref(false);
    let id = 0;
    const pending = reactive(new Map());
    const results = reactive(new Map());
    const free /* : Ref<boolean> */ = computed(() => {
        return pending.size < maxThreads;
    });
    const f = effect(() => {
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
                stop(d);
                stop(e);
                if (signal) {
                    signal.removeEventListener("abort", abort_listener);
                }
            }
            const d = effect(() => {
                if (destroyed.value) {
                    reject(new Error("pool is destroyed"));
                    stop(d);
                    clean();
                }
            });
            const e = effect(() => {
                const result = results.get(task_id);
                if (result) {
                    resolve(result);
                    stop(e);
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
        stop(f);
        destroyed.value = true;
    }
    function onQueueSizeChange(callback) {
        const r = effect(() => {
            callback(queue.size);
        });
        return () => {
            stop(r);
        };
    }
    function onPendingSizeChange(callback) {
        const r = effect(() => {
            callback(pending.size);
        });
        return () => {
            stop(r);
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
        threads: shallowReadonly(threads),
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
