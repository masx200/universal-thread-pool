export function create_worker(): Worker {
    const w = new Worker(new URL("./worker.ts", import.meta.url), {
        type: "module",
    });
    const error_event_listener = function (this: Worker, event: ErrorEvent) {
        console.warn("Error event:", event);
        // w.terminate();
        throw event;
    };
    w.addEventListener("error", error_event_listener);
    w.addEventListener("message", (e) => console.log(e.data));
    return w;
}
