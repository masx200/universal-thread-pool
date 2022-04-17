import { createThreadPool } from "../mod.ts";
import { assertEquals } from "./deps.ts";
import { create_remote } from "./create_remote.ts";
import { API } from "./api.ts";

Deno.test("ThreadPool-worker", async () => {
    const pool = createThreadPool({
        create: () =>
            create_remote<API>(
                function () {
                    const w = new Worker(
                        new URL("./worker.ts", import.meta.url),
                        {
                            type: "module",
                        },
                    );
                    const error_event_listener = function (
                        this: Worker,
                        event: ErrorEvent,
                    ) {
                        console.warn("Error event:", event);
                        // w.terminate();
                        throw event;
                    };
                    w.addEventListener("error", error_event_listener);
                    return w;
                },
                // error_event_listener
            ),
        terminate(w) {
            w.terminate();
        },
    });
    console.log("maxThreads", pool.maxThreads);
    const stop_callback_pending = pool.onPendingSizeChange((p) =>
        console.log("pending size", p)
    );
    const stop_callback_queue = pool.onQueueSizeChange((q) =>
        console.log("queue size", q)
    );
    assertEquals(pool.destroyed(), false);
    // console.log(pool);

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
    // console.log(pool.threads.length);
    // pool.threads.forEach((w) =>
    //     w.worker.removeEventListener("error", error_event_listener)
    // );
    assertEquals(pool.maxThreads, navigator.hardwareConcurrency);
    const controller = new AbortController();
    const p = pool.run((w) => w.remote.add(100, 10), controller.signal);
    controller.abort();
    const e = await p.catch((e) => e);
    // console.log(String(e));
    assertEquals(String(e), "Error: task signal aborted");
    const p2 = pool.run((w) => w.remote.add(100, 10));
    pool.destroy();
    const e2 = await p2.catch((e) => e);
    // console.log(String(e2));
    assertEquals(String(e2), "Error: pool is destroyed");
    //  console.log(pool.threads.length);
    stop_callback_queue();
    stop_callback_pending();
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
    // await sleep(2000)
});

// import { sleep } from "./sleep.ts";
