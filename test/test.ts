Deno.test("ThreadPool-worker", async () => {
    const pool = createThreadPool({
        create: () => create_remote(error_event_listener),
        terminate(w) {
            w.worker.terminate();
        },
    });
    assertEquals(pool.destroyed(), false);
    // console.log(pool);
    const error_event_listener = function (this: Worker, event: ErrorEvent) {
        console.warn("Error event:", event);
    };
    const tasks = [
        ...Array.from(
            { length: 10 },
            () =>
                (w: {
                    remote: {
                        add: (arg0: number, arg1: number) => Promise<number>;
                    };
                }) => w.remote.add(100, 1000),
        ),
        ...Array.from(
            { length: 10 },
            () =>
                (w: {
                    remote: {
                        add: (arg0: number, arg1: number) => Promise<number>;
                    };
                }) => w.remote.add(1000, 1000),
        ),
    ];

    const results = await Promise.all(tasks.map((t) => pool.run(t)));
    // console.log(pool);
    pool.threads.forEach((w) =>
        w.worker.removeEventListener("error", error_event_listener)
    );
    assertEquals(pool.maxThreads, navigator.hardwareConcurrency);
    const controller = new AbortController();
    const p = pool.run((w) => w.remote.add(100, 10), controller.signal);
    controller.abort();
    const e = await p.catch((e) => e);
    // console.log(String(e));
    assert(String(e) === "Error: task signal aborted");
    pool.destroy();
    assertEquals(
        results,
        [
            1100,
            1100,
            1100,
            1100,
            1100,
            1100,
            1100,
            1100,
            1100,
            1100,
            2000,
            2000,
            2000,
            2000,
            2000,
            2000,
            2000,
            2000,
            2000,
            2000,
        ],
    );
    // console.log(pool);
    assertEquals(pool.destroyed(), true);
});
import { createThreadPool } from "../createThreadPool.ts";
import { assert, assertEquals } from "../deps.ts";
import { create_remote } from "./create_remote.ts";
