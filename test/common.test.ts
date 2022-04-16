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
        return {
            terminate() {
                console.log("terminate");
            },
            async echo(a: number): Promise<number> {
                await sleep(100);
                return a;
            },
        };
    }
    const pool = createThreadPool({
        create,
        terminate(w) {
            w.terminate();
        },
    });

    const r = await Promise.all(
        Array(10)
            .fill(0)
            .map((_v, i) => pool.run((w) => w.echo(i))),
    );
    assertEquals(
        r,
        Array(10)
            .fill(0)
            .map((_v, i) => i),
    );
    pool.destroy();
});
import { assertEquals } from "../deps.ts";
