Deno.test("ThreadPool", async () => {
    const pool = createThreadPool({
        create: () => create_remote(error_event_listener),
        terminate(w) {
            w.worker.terminate();
        },
    });
    const error_event_listener = function (this: Worker, event: ErrorEvent) {
        console.warn("Error event:", event);
    };
    const tasks = Array.from(
        { length: 10 },
        () =>
            (w: {
                remote: {
                    add: (arg0: number, arg1: number) => Promise<number>;
                };
            }) => w.remote.add(100, 1000),
    );

    const results = await Promise.all(tasks.map((t) => pool.run(t)));
    pool.threads.forEach((w) =>
        w.worker.removeEventListener("error", error_event_listener)
    );
    pool.destroy();
    results.forEach((v) => {
        assertEquals(v, 100 + 1000);
    });
});
import { createThreadPool } from "../createThreadPool.ts";
import { assertEquals } from "../deps.ts";
import { create_remote } from "./create_remote.ts";
