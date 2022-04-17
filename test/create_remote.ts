import { API } from "./api.ts";
import { Remote, wrap } from "./deps.ts";
import { WorkerWithExit } from "./WorkerWithExit.ts";
export function create_remote(
    error_event_listener: (w: Worker, event: ErrorEvent) => void,
): { terminate(): void; worker: Worker; remote: Remote<API> } {
    const w = new WorkerWithExit(new URL("./worker.ts", import.meta.url), {
        type: "module",
    });
    // let exited = false;
    const remote = wrap<API>(w);
    w.addEventListener("error", (event) => error_event_listener(w, event));
    // const old_terminate = w.terminate.bind(w);
    // w.terminate = () => {
    //     if (exited) return;
    //     exited = true;
    //     old_terminate();
    //     w.dispatchEvent(new Event("exit"));
    // };
    return {
        worker: w,
        remote,
        terminate() {
            w.terminate();
        },
    };
}
