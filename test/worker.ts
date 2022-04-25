import { API } from "./api.ts";
import { expose } from "./deps.ts";
import { sleep } from "./sleep.ts";
async function add(a: number, b: number): Promise<number> {
    await sleep(100);
    // console.log("in worker ,add," + a + "," + b);
    return a + b;
}
const api: API = { add };
expose(api);

// deno-lint-ignore ban-ts-comment
//@ts-ignore
// deno-lint-ignore no-explicit-any
self.addEventListener("message", (e: MessageEvent<any>) => console.log(e.data));
