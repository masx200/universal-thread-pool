import { createThreadPool } from "../createThreadPool.ts";

Deno.test("ThreadPool-common", async () => {
    function sleep(timeout: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, timeout);
        });
    }
    function create() {
        let terminated = false;
        return {
            terminate() {
                terminated = true;
            },
            async echo(a: number): Promise<number> {
                if (terminated) throw Error("terminated");
                await sleep(100);
                return a * 2;
            },
        };
    }
    const pool = createThreadPool({
        create,
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
    const r = await Promise.all(
        Array(10)
            .fill(0)
            .map((_v, i) => pool.run((w) => w.echo(i))),
    );
    assertEquals(
        r,
        Array(10)
            .fill(0)
            .map((_v, i) => i * 2),
    );

    pool.destroy();
    stop_callback_queue();
    stop_callback_pending();
});
import { assertEquals } from "../deps.ts";
